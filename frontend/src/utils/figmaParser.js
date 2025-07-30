const fs = require('fs');
const axios = require('axios');

// ====== 配置区 ======
const FIGMA_TOKEN = process.env.FIGMA_TOKEN || 'YOUR_FIGMA_TOKEN_HERE';
const FILE_KEY = 'WruJi7vZLGqPD8isXCWeVo'; // 目标Figma文件
const OUTPUT_HTML = '../../figma-page.html'; // 输出到根目录
const OUTPUT_CSS = '../../figma-page.css'; // 输出到根目录
const TARGET_NODE_ID = '9-977'; // 目标页面Node ID
// =====================

const API_URL = `https://api.figma.com/v1/files/${FILE_KEY}`;

async function fetchFigmaFile() {
  const res = await axios.get(API_URL, {
    headers: { 'X-Figma-Token': FIGMA_TOKEN }
  });
  return res.data;
}

function cssColor(paint) {
  if (!paint || paint.type !== 'SOLID') return 'transparent';
  const { r, g, b, a } = paint.color;
  const alpha = paint.opacity !== undefined ? paint.opacity : (a !== undefined ? a : 1);
  return `rgba(${Math.round(r*255)},${Math.round(g*255)},${Math.round(b*255)},${alpha})`;
}

let cssRules = [];
let nodeIdToClass = {};
let classCount = 0;

function genClassName(node) {
  if (nodeIdToClass[node.id]) return nodeIdToClass[node.id];
  const cname = `figma-node-${classCount++}`;
  nodeIdToClass[node.id] = cname;
  return cname;
}

function nodeToHtml(node) {
  const cname = genClassName(node);
  let style = '';
  if (node.absoluteBoundingBox) {
    const { x, y, width, height } = node.absoluteBoundingBox;
    style += `left:${x}px;top:${y}px;width:${width}px;height:${height}px;position:absolute;`;
  }
  if (node.fills && node.fills.length > 0) {
    style += `background:${cssColor(node.fills[0])};`;
  }
  if (node.type === 'TEXT' && node.characters) {
    // 字体样式
    if (node.style) {
      if (node.style.fontSize) style += `font-size:${node.style.fontSize}px;`;
      if (node.style.fontFamily) style += `font-family:${node.style.fontFamily};`;
      if (node.style.fontWeight) style += `font-weight:${node.style.fontWeight};`;
      if (node.style.lineHeightPx) style += `line-height:${node.style.lineHeightPx}px;`;
      if (node.style.letterSpacing) style += `letter-spacing:${node.style.letterSpacing}px;`;
    }
    if (node.fills && node.fills[0] && node.fills[0].type === 'SOLID') {
      style += `color:${cssColor(node.fills[0])};`;
    }
  }
  cssRules.push(`.${cname}{${style}}`);
  let html = '';
  if (node.type === 'FRAME' || node.type === 'RECTANGLE' || node.type === 'GROUP') {
    html = `<div class="${cname}">`;
    if (node.children) {
      html += node.children.map(nodeToHtml).join('');
    }
    html += '</div>';
  } else if (node.type === 'TEXT') {
    html = `<div class="${cname}">${node.characters || ''}</div>`;
  }
  return html;
}

function findTargetNode(doc, nodeId) {
  if (doc.id === nodeId) return doc;
  if (!doc.children) return null;
  for (const child of doc.children) {
    const found = findTargetNode(child, nodeId);
    if (found) return found;
  }
  return null;
}

async function main() {
  try {
    const figmaData = await fetchFigmaFile();
    const doc = figmaData.document;
    const target = findTargetNode(doc, TARGET_NODE_ID);
    if (!target) throw new Error('未找到目标Node');
    cssRules = [];
    nodeIdToClass = {};
    classCount = 0;
    const html = `<div class="figma-root" style="position:relative;">${nodeToHtml(target)}</div>`;
    const css = `.figma-root{position:relative;}
${cssRules.join('\n')}`;
    fs.writeFileSync(OUTPUT_HTML, html, 'utf-8');
    fs.writeFileSync(OUTPUT_CSS, css, 'utf-8');
    console.log('已生成 figma-page.html 和 figma-page.css');
  } catch (error) {
    console.error('错误:', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, fetchFigmaFile, nodeToHtml }; 