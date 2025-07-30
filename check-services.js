// 检查服务状态脚本
const http = require('http');

// 检查后端服务
function checkBackend() {
    return new Promise((resolve) => {
        const req = http.get('http://localhost:8080/api/health', (res) => {
            console.log('✅ 后端服务运行正常 - 状态码:', res.statusCode);
            resolve(true);
        });

        req.on('error', (err) => {
            console.log('❌ 后端服务未响应:', err.message);
            resolve(false);
        });

        req.setTimeout(5000, () => {
            console.log('❌ 后端服务响应超时');
            req.destroy();
            resolve(false);
        });
    });
}

// 检查前端服务
function checkFrontend() {
    return new Promise((resolve) => {
        const req = http.get('http://localhost:5173', (res) => {
            console.log('✅ 前端服务运行正常 - 状态码:', res.statusCode);
            resolve(true);
        });

        req.on('error', (err) => {
            console.log('❌ 前端服务未响应:', err.message);
            resolve(false);
        });

        req.setTimeout(5000, () => {
            console.log('❌ 前端服务响应超时');
            req.destroy();
            resolve(false);
        });
    });
}

// 主函数
async function main() {
    console.log('🔍 检查服务状态...\n');

    console.log('1. 检查后端服务 (http://localhost:8080)');
    await checkBackend();

    console.log('\n2. 检查前端服务 (http://localhost:5173)');
    await checkFrontend();

    console.log('\n📋 服务检查完成');
    console.log('如果服务未运行，请手动启动：');
    console.log('  后端: cd "Questionnaire system" && mvn spring-boot:run');
    console.log('  前端: cd frontend && npm run dev');
}

main(); 