/**
 * 测试运行器 - 按照测试用例驱动开发
 * 用于自动化执行测试用例并记录结果
 */

class TestRunner {
  constructor() {
    this.testResults = [];
    this.currentTest = null;
    this.baseUrl = 'http://localhost:3000';
    this.apiUrl = 'http://localhost:8080/api';
  }

  // 开始测试
  startTest(testId, testName) {
    this.currentTest = {
      id: testId,
      name: testName,
      startTime: new Date(),
      steps: [],
      status: 'running',
      errors: []
    };
    console.log(`🧪 开始测试: ${testName}`);
  }

  // 记录测试步骤
  logStep(step, result, expected, actual) {
    const stepResult = {
      step,
      result: result ? '✅ PASS' : '❌ FAIL',
      expected,
      actual,
      timestamp: new Date()
    };
    
    if (this.currentTest) {
      this.currentTest.steps.push(stepResult);
    }
    
    console.log(`  ${stepResult.result} ${step}`);
    if (!result) {
      console.log(`    Expected: ${expected}`);
      console.log(`    Actual: ${actual}`);
    }
  }

  // 记录错误
  logError(error) {
    if (this.currentTest) {
      this.currentTest.errors.push({
        message: error.message,
        stack: error.stack,
        timestamp: new Date()
      });
    }
    console.error(`  ❌ ERROR: ${error.message}`);
  }

  // 完成测试
  endTest() {
    if (this.currentTest) {
      this.currentTest.endTime = new Date();
      this.currentTest.duration = this.currentTest.endTime - this.currentTest.startTime;
      this.currentTest.status = this.currentTest.errors.length > 0 ? 'failed' : 'passed';
      
      this.testResults.push(this.currentTest);
      
      console.log(`📊 测试完成: ${this.currentTest.name} - ${this.currentTest.status.toUpperCase()}`);
      console.log(`⏱️  用时: ${this.currentTest.duration}ms`);
      
      this.currentTest = null;
    }
  }

  // API测试辅助方法
  async apiTest(endpoint, method = 'GET', data = null, headers = {}) {
    try {
      const url = `${this.apiUrl}${endpoint}`;
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      const responseData = await response.json();

      return {
        status: response.status,
        ok: response.ok,
        data: responseData,
        headers: response.headers
      };
    } catch (error) {
      this.logError(error);
      return { error: error.message };
    }
  }

  // 生成测试报告
  generateReport() {
    const report = {
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(t => t.status === 'passed').length,
        failed: this.testResults.filter(t => t.status === 'failed').length,
        totalDuration: this.testResults.reduce((sum, t) => sum + t.duration, 0)
      },
      results: this.testResults
    };

    console.log('\n📋 测试报告汇总:');
    console.log(`总测试数: ${report.summary.total}`);
    console.log(`通过: ${report.summary.passed}`);
    console.log(`失败: ${report.summary.failed}`);
    console.log(`总用时: ${report.summary.totalDuration}ms`);

    return report;
  }
}

// 身份认证测试套件
class AuthTestSuite {
  constructor(testRunner) {
    this.runner = testRunner;
  }

  // TC001.1 - 管理员正常登录测试
  async testAdminLogin() {
    this.runner.startTest('TC001.1', '管理员正常登录测试');

    try {
      // 测试数据
      const loginData = {
        username: 'admin',
        password: 'admin123'
      };

      // 执行登录API调用
      const response = await this.runner.apiTest('/auth/login', 'POST', loginData);

      // 验证响应状态
      this.runner.logStep(
        '验证HTTP状态码',
        response.status === 200,
        '200',
        response.status
      );

      // 验证响应数据结构
      if (response.data) {
        this.runner.logStep(
          '验证返回Token',
          !!response.data.token,
          '有Token返回',
          response.data.token ? '有Token' : '无Token'
        );

        this.runner.logStep(
          '验证用户信息',
          !!response.data.userInfo,
          '有用户信息',
          response.data.userInfo ? '有用户信息' : '无用户信息'
        );

        if (response.data.userInfo) {
          this.runner.logStep(
            '验证用户角色',
            response.data.userInfo.role === 'ADMIN',
            'ADMIN',
            response.data.userInfo.role
          );
        }
      }

    } catch (error) {
      this.runner.logError(error);
    }

    this.runner.endTest();
  }

  // TC001.2 - 普通考生正常登录测试
  async testStudentLogin() {
    this.runner.startTest('TC001.2', '普通考生正常登录测试');

    try {
      const loginData = {
        username: 'lisi',
        password: 'admin123'
      };

      const response = await this.runner.apiTest('/auth/login', 'POST', loginData);

      this.runner.logStep(
        '验证HTTP状态码',
        response.status === 200,
        '200',
        response.status
      );

      if (response.data && response.data.userInfo) {
        this.runner.logStep(
          '验证用户角色',
          response.data.userInfo.role === 'USER',
          'USER',
          response.data.userInfo.role
        );
      }

    } catch (error) {
      this.runner.logError(error);
    }

    this.runner.endTest();
  }

  // TC001.3 - 登录异常场景测试
  async testLoginErrorScenarios() {
    this.runner.startTest('TC001.3', '登录异常场景测试');

    try {
      // 测试错误密码
      let response = await this.runner.apiTest('/auth/login', 'POST', {
        username: 'admin',
        password: '错误密码'
      });

      this.runner.logStep(
        '错误密码应返回401',
        response.status === 401 || response.status === 400,
        '401或400',
        response.status
      );

      // 测试不存在用户
      response = await this.runner.apiTest('/auth/login', 'POST', {
        username: '不存在用户',
        password: 'admin123'
      });

      this.runner.logStep(
        '不存在用户应返回401',
        response.status === 401 || response.status === 400,
        '401或400',
        response.status
      );

      // 测试空用户名
      response = await this.runner.apiTest('/auth/login', 'POST', {
        username: '',
        password: 'admin123'
      });

      this.runner.logStep(
        '空用户名应返回400',
        response.status === 400,
        '400',
        response.status
      );

    } catch (error) {
      this.runner.logError(error);
    }

    this.runner.endTest();
  }
}

class StudentRecordsTestSuite {
  constructor(runner) {
    this.runner = runner;
  }

  // TC004.1 - 个人答题记录列表测试
  async testRecordsList() {
    this.runner.startTest('TC004.1', '个人答题记录列表测试');

    try {
      // 先登录获取Token
      const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'lisi', password: 'admin123' })
      });

      if (!loginResponse.ok) {
        throw new Error('登录失败');
      }

      const loginData = await loginResponse.json();
      const token = loginData.data.token;

      // 测试获取个人答题记录列表
      const listResponse = await fetch('http://localhost:8080/api/answer-sessions/my-records', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      this.runner.logStep(
        '获取个人答题记录列表',
        listResponse.ok,
        '200状态码',
        listResponse.status.toString()
      );

      if (listResponse.ok) {
        const data = await listResponse.json();
        
        // 验证返回数据结构
        const hasRecords = data && Array.isArray(data.records);
        this.runner.logStep(
          '验证返回数据结构',
          hasRecords,
          '包含records数组',
          hasRecords ? '数据结构正确' : '数据结构错误'
        );

        // 验证分页信息
        const hasPagination = data && typeof data.total === 'number';
        this.runner.logStep(
          '验证分页信息',
          hasPagination,
          '包含分页信息',
          hasPagination ? '分页信息完整' : '缺少分页信息'
        );
      }

    } catch (error) {
      this.runner.logError(error);
    }

    this.runner.endTest();
  }

  // TC004.2 - 答题记录详情测试
  async testRecordDetail() {
    this.runner.startTest('TC004.2', '答题记录详情测试');

    try {
      // 先登录获取Token
      const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'lisi', password: 'admin123' })
      });

      if (!loginResponse.ok) {
        throw new Error('登录失败');
      }

      const loginData = await loginResponse.json();
      const token = loginData.data.token;

      // 先获取记录列表
      const listResponse = await fetch('http://localhost:8080/api/answer-sessions/my-records', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!listResponse.ok) {
        throw new Error('获取记录列表失败');
      }

      const listData = await listResponse.json();
      if (!listData.records || listData.records.length === 0) {
        throw new Error('没有可用的答题记录');
      }

      // 获取第一条记录的详情
      const recordId = listData.records[0].id;
      const detailResponse = await fetch(`http://localhost:8080/api/answer-record/${recordId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      this.runner.logStep(
        '获取答题记录详情',
        detailResponse.ok,
        '200状态码',
        detailResponse.status.toString()
      );

      if (detailResponse.ok) {
        const detailData = await detailResponse.json();
        
        // 验证详情数据完整性
        const hasDetail = detailData && detailData.data;
        this.runner.logStep(
          '验证详情数据完整性',
          hasDetail,
          '包含完整详情数据',
          hasDetail ? '数据完整' : '数据不完整'
        );

        if (hasDetail) {
          // 验证必要字段
          const requiredFields = ['id', 'sessionId', 'questionId', 'userAnswer', 'score'];
          const missingFields = requiredFields.filter(field => !detailData.data.hasOwnProperty(field));
          
          this.runner.logStep(
            '验证必要字段',
            missingFields.length === 0,
            '包含所有必要字段',
            missingFields.length === 0 ? '字段完整' : `缺少字段: ${missingFields.join(', ')}`
          );
        }
      }

    } catch (error) {
      this.runner.logError(error);
    }

    this.runner.endTest();
  }

  // TC004.3 - 答题统计信息测试
  async testRecordStats() {
    this.runner.startTest('TC004.3', '答题统计信息测试');

    try {
      // 先登录获取Token
      const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'lisi', password: 'admin123' })
      });

      if (!loginResponse.ok) {
        throw new Error('登录失败');
      }

      const loginData = await loginResponse.json();
      const token = loginData.data.token;

      // 获取个人答题统计
      const statsResponse = await fetch('http://localhost:8080/api/answer-sessions/my-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      this.runner.logStep(
        '获取答题统计信息',
        statsResponse.ok,
        '200状态码',
        statsResponse.status.toString()
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        
        // 验证统计数据
        const hasStats = statsData && statsData.data;
        this.runner.logStep(
          '验证统计数据',
          hasStats,
          '包含统计数据',
          hasStats ? '数据存在' : '数据缺失'
        );

        if (hasStats) {
          // 验证统计指标
          const metrics = ['totalSessions', 'completedSessions', 'averageScore'];
          const missingMetrics = metrics.filter(metric => 
            typeof statsData.data[metric] === 'undefined'
          );
          
          this.runner.logStep(
            '验证统计指标',
            missingMetrics.length === 0,
            '包含所有统计指标',
            missingMetrics.length === 0 ? '指标完整' : `缺少指标: ${missingMetrics.join(', ')}`
          );
        }
      }

    } catch (error) {
      this.runner.logError(error);
    }

    this.runner.endTest();
  }
}

// 评分功能测试套件
class ScoringTestSuite {
  constructor(runner) {
    this.runner = runner;
  }

  // TC005.1 - 获取待评分记录列表
  async testGetNeedScoringRecords() {
    this.runner.startTest('TC005.1', '获取待评分记录列表测试');

    try {
      // 先登录获取token
      const loginResponse = await this.runner.apiTest('/auth/login', 'POST', {
        username: 'admin',
        password: 'admin123'
      });

      if (!loginResponse.data?.token) {
        throw new Error('登录失败，无法获取token');
      }

      const token = loginResponse.data.token;

      // 获取待评分记录
      const response = await this.runner.apiTest(
        '/answer-record/need-scoring',
        'GET',
        null,
        { Authorization: `Bearer ${token}` }
      );

      // 验证响应状态
      this.runner.logStep(
        '验证HTTP状态码',
        response.status === 200,
        '200',
        response.status
      );

      // 验证响应数据结构
      if (response.data) {
        this.runner.logStep(
          '验证返回数据是否为数组',
          Array.isArray(response.data),
          'Array',
          typeof response.data
        );

        // 验证每条记录的数据结构
        if (Array.isArray(response.data) && response.data.length > 0) {
          const record = response.data[0];
          this.runner.logStep(
            '验证记录数据结构',
            record.hasOwnProperty('id') && 
            record.hasOwnProperty('questionId') && 
            record.hasOwnProperty('answer') && 
            record.hasOwnProperty('submitTime'),
            '包含必要字段',
            Object.keys(record).join(', ')
          );
        }
      }

    } catch (error) {
      this.runner.logError(error);
    }

    this.runner.endTest();
  }

  // TC005.2 - 提交评分测试
  async testSubmitScoring() {
    this.runner.startTest('TC005.2', '提交评分测试');

    try {
      // 先登录获取token
      const loginResponse = await this.runner.apiTest('/auth/login', 'POST', {
        username: 'admin',
        password: 'admin123'
      });

      if (!loginResponse.data?.token) {
        throw new Error('登录失败，无法获取token');
      }

      const token = loginResponse.data.token;

      // 获取一条待评分记录
      const recordsResponse = await this.runner.apiTest(
        '/answer-record/need-scoring',
        'GET',
        null,
        { Authorization: `Bearer ${token}` }
      );

      if (!Array.isArray(recordsResponse.data) || recordsResponse.data.length === 0) {
        throw new Error('没有找到待评分的记录');
      }

      const recordToScore = recordsResponse.data[0];

      // 提交评分
      const scoringData = {
        recordId: recordToScore.id,
        score: 85,
        comment: '答案基本正确，但有些细节需要改进',
        maxScore: 100
      };

      const response = await this.runner.apiTest(
        '/scoring/submit',
        'POST',
        scoringData,
        { Authorization: `Bearer ${token}` }
      );

      // 验证响应状态
      this.runner.logStep(
        '验证HTTP状态码',
        response.status === 200,
        '200',
        response.status
      );

      // 验证响应数据
      if (response.data) {
        this.runner.logStep(
          '验证评分是否成功',
          response.data.success === true,
          'true',
          response.data.success
        );
      }

    } catch (error) {
      this.runner.logError(error);
    }

    this.runner.endTest();
  }
}

// 统计分析功能测试套件
class StatisticsTestSuite {
  constructor(runner) {
    this.runner = runner;
  }

  // TC006.1 - 获取仪表盘统计数据
  async testDashboardStats() {
    this.runner.startTest('TC006.1', '仪表盘统计数据测试');

    try {
      // 先登录获取token
      const loginResponse = await this.runner.apiTest('/auth/login', 'POST', {
        username: 'admin',
        password: 'admin123'
      });

      if (!loginResponse.data?.token) {
        throw new Error('登录失败，无法获取token');
      }

      const token = loginResponse.data.token;

      // 获取仪表盘统计数据
      const response = await this.runner.apiTest(
        '/statistics/dashboard',
        'GET',
        null,
        { Authorization: `Bearer ${token}` }
      );

      // 验证响应状态
      this.runner.logStep(
        '验证HTTP状态码',
        response.status === 200,
        '200',
        response.status
      );

      // 验证响应数据结构
      if (response.data) {
        this.runner.logStep(
          '验证统计数据结构',
          response.data.hasOwnProperty('totalQuestions') &&
          response.data.hasOwnProperty('totalSessions') &&
          response.data.hasOwnProperty('completedSessions') &&
          response.data.hasOwnProperty('totalUsers'),
          '包含必要统计字段',
          Object.keys(response.data).join(', ')
        );

        // 验证数据类型
        this.runner.logStep(
          '验证数据类型',
          typeof response.data.totalQuestions === 'number' &&
          typeof response.data.totalSessions === 'number' &&
          typeof response.data.completedSessions === 'number' &&
          typeof response.data.totalUsers === 'number',
          '所有统计数据为数值类型',
          `totalQuestions: ${typeof response.data.totalQuestions}, 
           totalSessions: ${typeof response.data.totalSessions},
           completedSessions: ${typeof response.data.completedSessions},
           totalUsers: ${typeof response.data.totalUsers}`
        );
      }

    } catch (error) {
      this.runner.logError(error);
    }

    this.runner.endTest();
  }

  // TC006.2 - 获取趋势数据测试
  async testTrendData() {
    this.runner.startTest('TC006.2', '趋势数据测试');

    try {
      // 先登录获取token
      const loginResponse = await this.runner.apiTest('/auth/login', 'POST', {
        username: 'admin',
        password: 'admin123'
      });

      if (!loginResponse.data?.token) {
        throw new Error('登录失败，无法获取token');
      }

      const token = loginResponse.data.token;

      // 获取趋势数据
      const response = await this.runner.apiTest(
        '/statistics/trend?days=7',
        'GET',
        null,
        { Authorization: `Bearer ${token}` }
      );

      // 验证响应状态
      this.runner.logStep(
        '验证HTTP状态码',
        response.status === 200,
        '200',
        response.status
      );

      // 验证响应数据结构
      if (response.data) {
        this.runner.logStep(
          '验证趋势数据结构',
          Array.isArray(response.data.dates) &&
          Array.isArray(response.data.counts),
          '包含日期和数量数组',
          Object.keys(response.data).join(', ')
        );

        // 验证数组长度
        if (Array.isArray(response.data.dates) && Array.isArray(response.data.counts)) {
          this.runner.logStep(
            '验证数据长度',
            response.data.dates.length === 7 && response.data.counts.length === 7,
            '7天的数据',
            `dates: ${response.data.dates.length}, counts: ${response.data.counts.length}`
          );
        }
      }

    } catch (error) {
      this.runner.logError(error);
    }

    this.runner.endTest();
  }

  // TC006.3 - 获取题目统计数据测试
  async testQuestionStats() {
    this.runner.startTest('TC006.3', '题目统计数据测试');

    try {
      // 先登录获取token
      const loginResponse = await this.runner.apiTest('/auth/login', 'POST', {
        username: 'admin',
        password: 'admin123'
      });

      if (!loginResponse.data?.token) {
        throw new Error('登录失败，无法获取token');
      }

      const token = loginResponse.data.token;

      // 获取题目统计数据
      const response = await this.runner.apiTest(
        '/statistics/question/1', // 测试第一题的统计数据
        'GET',
        null,
        { Authorization: `Bearer ${token}` }
      );

      // 验证响应状态
      this.runner.logStep(
        '验证HTTP状态码',
        response.status === 200,
        '200',
        response.status
      );

      // 验证响应数据结构
      if (response.data) {
        this.runner.logStep(
          '验证题目统计数据结构',
          response.data.hasOwnProperty('questionId') &&
          response.data.hasOwnProperty('totalAnswers') &&
          response.data.hasOwnProperty('correctRate') &&
          response.data.hasOwnProperty('avgScore'),
          '包含必要统计字段',
          Object.keys(response.data).join(', ')
        );

        // 验证数据类型
        this.runner.logStep(
          '验证数据类型',
          typeof response.data.questionId === 'number' &&
          typeof response.data.totalAnswers === 'number' &&
          typeof response.data.correctRate === 'number' &&
          typeof response.data.avgScore === 'number',
          '所有统计数据为数值类型',
          `questionId: ${typeof response.data.questionId}, 
           totalAnswers: ${typeof response.data.totalAnswers},
           correctRate: ${typeof response.data.correctRate},
           avgScore: ${typeof response.data.avgScore}`
        );
      }

    } catch (error) {
      this.runner.logError(error);
    }

    this.runner.endTest();
  }
}

// 考生答题功能测试套件
class StudentAnswerTestSuite {
  constructor(runner) {
    this.runner = runner;
  }

  // TC007.1 - 创建答题会话测试
  async testCreateAnswerSession() {
    this.runner.startTest('TC007.1', '创建答题会话测试');

    try {
      // 先登录获取token
      const loginResponse = await this.runner.apiTest('/auth/login', 'POST', {
        username: 'lisi',
        password: 'admin123'
      });

      if (!loginResponse.data?.token) {
        throw new Error('登录失败，无法获取token');
      }

      const token = loginResponse.data.token;

      // 创建答题会话
      const response = await this.runner.apiTest(
        '/answer-session/create',
        'POST',
        {
          questionBankId: 1,
          title: '测试答题会话',
          duration: 60, // 60分钟
          startTime: new Date().toISOString()
        },
        { Authorization: `Bearer ${token}` }
      );

      // 验证响应状态
      this.runner.logStep(
        '验证HTTP状态码',
        response.status === 200,
        '200',
        response.status
      );

      // 验证响应数据结构
      if (response.data) {
        this.runner.logStep(
          '验证会话数据结构',
          response.data.hasOwnProperty('sessionId') &&
          response.data.hasOwnProperty('sessionCode') &&
          response.data.hasOwnProperty('startTime') &&
          response.data.hasOwnProperty('endTime'),
          '包含必要字段',
          Object.keys(response.data).join(', ')
        );

        // 保存会话ID供后续测试使用
        this.sessionId = response.data.sessionId;
      }

    } catch (error) {
      this.runner.logError(error);
    }

    this.runner.endTest();
  }

  // TC007.2 - 获取题目列表测试
  async testGetQuestions() {
    this.runner.startTest('TC007.2', '获取题目列表测试');

    try {
      // 先登录获取token
      const loginResponse = await this.runner.apiTest('/auth/login', 'POST', {
        username: 'lisi',
        password: 'admin123'
      });

      if (!loginResponse.data?.token) {
        throw new Error('登录失败，无法获取token');
      }

      const token = loginResponse.data.token;

      // 获取题目列表
      const response = await this.runner.apiTest(
        `/answer-session/${this.sessionId}/questions`,
        'GET',
        null,
        { Authorization: `Bearer ${token}` }
      );

      // 验证响应状态
      this.runner.logStep(
        '验证HTTP状态码',
        response.status === 200,
        '200',
        response.status
      );

      // 验证响应数据结构
      if (response.data) {
        this.runner.logStep(
          '验证题目列表结构',
          Array.isArray(response.data),
          '返回数组',
          typeof response.data
        );

        if (Array.isArray(response.data) && response.data.length > 0) {
          const question = response.data[0];
          this.runner.logStep(
            '验证题目数据结构',
            question.hasOwnProperty('id') &&
            question.hasOwnProperty('type') &&
            question.hasOwnProperty('content') &&
            question.hasOwnProperty('options'),
            '包含必要字段',
            Object.keys(question).join(', ')
          );

          // 保存第一题ID供后续测试使用
          this.firstQuestionId = question.id;
        }
      }

    } catch (error) {
      this.runner.logError(error);
    }

    this.runner.endTest();
  }

  // TC007.3 - 提交答案测试
  async testSubmitAnswer() {
    this.runner.startTest('TC007.3', '提交答案测试');

    try {
      // 先登录获取token
      const loginResponse = await this.runner.apiTest('/auth/login', 'POST', {
        username: 'lisi',
        password: 'admin123'
      });

      if (!loginResponse.data?.token) {
        throw new Error('登录失败，无法获取token');
      }

      const token = loginResponse.data.token;

      // 提交答案
      const response = await this.runner.apiTest(
        '/answer-record/submit',
        'POST',
        {
          sessionId: this.sessionId,
          questionId: this.firstQuestionId,
          answer: 'A', // 假设是单选题
          timeSpent: 60 // 花费60秒
        },
        { Authorization: `Bearer ${token}` }
      );

      // 验证响应状态
      this.runner.logStep(
        '验证HTTP状态码',
        response.status === 200,
        '200',
        response.status
      );

      // 验证响应数据
      if (response.data) {
        this.runner.logStep(
          '验证提交结果',
          response.data.success === true,
          'true',
          response.data.success
        );
      }

    } catch (error) {
      this.runner.logError(error);
    }

    this.runner.endTest();
  }

  // TC007.4 - 不同题型答题测试
  async testDifferentQuestionTypes() {
    this.runner.startTest('TC007.4', '不同题型答题测试');

    try {
      // 先登录获取token
      const loginResponse = await this.runner.apiTest('/auth/login', 'POST', {
        username: 'lisi',
        password: 'admin123'
      });

      if (!loginResponse.data?.token) {
        throw new Error('登录失败，无法获取token');
      }

      const token = loginResponse.data.token;

      // 测试不同题型的答案提交
      const questionTypes = [
        { type: 'single_choice', answer: 'A' },
        { type: 'multiple_choice', answer: ['A', 'B'] },
        { type: 'fill_blank', answer: '答案内容' },
        { type: 'essay', answer: '这是一段主观题答案...' }
      ];

      for (const qType of questionTypes) {
        const response = await this.runner.apiTest(
          '/answer-record/submit',
          'POST',
          {
            sessionId: this.sessionId,
            questionId: this.firstQuestionId,
            answer: qType.answer,
            questionType: qType.type,
            timeSpent: 60
          },
          { Authorization: `Bearer ${token}` }
        );

        this.runner.logStep(
          `验证${qType.type}类型题目提交`,
          response.status === 200 && response.data?.success === true,
          'true',
          response.data?.success
        );
      }

    } catch (error) {
      this.runner.logError(error);
    }

    this.runner.endTest();
  }
}

// 答题过程控制测试套件
class AnswerProcessTestSuite {
  constructor(runner) {
    this.runner = runner;
  }

  // TC008.1 - 答题进度控制测试
  async testProgressControl() {
    this.runner.startTest('TC008.1', '答题进度控制测试');

    try {
      // 先登录获取token
      const loginResponse = await this.runner.apiTest('/auth/login', 'POST', {
        username: 'lisi',
        password: 'admin123'
      });

      if (!loginResponse.data?.token) {
        throw new Error('登录失败，无法获取token');
      }

      const token = loginResponse.data.token;

      // 创建答题会话
      const sessionResponse = await this.runner.apiTest(
        '/answer-session/create',
        'POST',
        {
          questionBankId: 1,
          title: '进度控制测试会话',
          duration: 60,
          startTime: new Date().toISOString()
        },
        { Authorization: `Bearer ${token}` }
      );

      if (!sessionResponse.data?.sessionId) {
        throw new Error('创建会话失败');
      }

      const sessionId = sessionResponse.data.sessionId;

      // 获取题目列表
      const questionsResponse = await this.runner.apiTest(
        `/answer-session/${sessionId}/questions`,
        'GET',
        null,
        { Authorization: `Bearer ${token}` }
      );

      // 验证题目列表
      this.runner.logStep(
        '验证题目列表',
        Array.isArray(questionsResponse.data),
        '返回数组',
        typeof questionsResponse.data
      );

      // 获取答题进度
      const progressResponse = await this.runner.apiTest(
        `/answer-session/${sessionId}/progress`,
        'GET',
        null,
        { Authorization: `Bearer ${token}` }
      );

      // 验证进度数据
      this.runner.logStep(
        '验证进度数据结构',
        progressResponse.data?.hasOwnProperty('totalQuestions') &&
        progressResponse.data?.hasOwnProperty('answeredQuestions') &&
        progressResponse.data?.hasOwnProperty('remainingTime'),
        '包含必要字段',
        Object.keys(progressResponse.data || {}).join(', ')
      );

    } catch (error) {
      this.runner.logError(error);
    }

    this.runner.endTest();
  }

  // TC008.2 - 时间管理测试
  async testTimeManagement() {
    this.runner.startTest('TC008.2', '时间管理测试');

    try {
      // 先登录获取token
      const loginResponse = await this.runner.apiTest('/auth/login', 'POST', {
        username: 'lisi',
        password: 'admin123'
      });

      if (!loginResponse.data?.token) {
        throw new Error('登录失败，无法获取token');
      }

      const token = loginResponse.data.token;

      // 创建一个短时间的答题会话
      const sessionResponse = await this.runner.apiTest(
        '/answer-session/create',
        'POST',
        {
          questionBankId: 1,
          title: '时间管理测试会话',
          duration: 1, // 1分钟
          startTime: new Date().toISOString()
        },
        { Authorization: `Bearer ${token}` }
      );

      if (!sessionResponse.data?.sessionId) {
        throw new Error('创建会话失败');
      }

      const sessionId = sessionResponse.data.sessionId;

      // 获取剩余时间
      const timeResponse = await this.runner.apiTest(
        `/answer-session/${sessionId}/remaining-time`,
        'GET',
        null,
        { Authorization: `Bearer ${token}` }
      );

      // 验证时间数据
      this.runner.logStep(
        '验证时间数据',
        timeResponse.data?.hasOwnProperty('remainingSeconds') &&
        timeResponse.data.remainingSeconds <= 60,
        '剩余时间小于等于60秒',
        timeResponse.data?.remainingSeconds
      );

      // 等待65秒后尝试提交答案（超时）
      await new Promise(resolve => setTimeout(resolve, 65000));

      const submitResponse = await this.runner.apiTest(
        '/answer-record/submit',
        'POST',
        {
          sessionId: sessionId,
          questionId: 1,
          answer: 'A',
          timeSpent: 10
        },
        { Authorization: `Bearer ${token}` }
      );

      // 验证超时提交被拒绝
      this.runner.logStep(
        '验证超时提交',
        submitResponse.status === 403,
        '403',
        submitResponse.status
      );

    } catch (error) {
      this.runner.logError(error);
    }

    this.runner.endTest();
  }

  // TC008.3 - 会话保持测试
  async testSessionKeepAlive() {
    this.runner.startTest('TC008.3', '会话保持测试');

    try {
      // 先登录获取token
      const loginResponse = await this.runner.apiTest('/auth/login', 'POST', {
        username: 'lisi',
        password: 'admin123'
      });

      if (!loginResponse.data?.token) {
        throw new Error('登录失败，无法获取token');
      }

      const token = loginResponse.data.token;

      // 创建答题会话
      const sessionResponse = await this.runner.apiTest(
        '/answer-session/create',
        'POST',
        {
          questionBankId: 1,
          title: '会话保持测试',
          duration: 30,
          startTime: new Date().toISOString()
        },
        { Authorization: `Bearer ${token}` }
      );

      if (!sessionResponse.data?.sessionId) {
        throw new Error('创建会话失败');
      }

      const sessionId = sessionResponse.data.sessionId;

      // 每10秒发送一次心跳
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 10000));

        const heartbeatResponse = await this.runner.apiTest(
          `/answer-session/${sessionId}/heartbeat`,
          'POST',
          null,
          { Authorization: `Bearer ${token}` }
        );

        this.runner.logStep(
          `第${i + 1}次心跳`,
          heartbeatResponse.status === 200,
          '200',
          heartbeatResponse.status
        );
      }

      // 验证会话状态
      const statusResponse = await this.runner.apiTest(
        `/answer-session/${sessionId}/status`,
        'GET',
        null,
        { Authorization: `Bearer ${token}` }
      );

      this.runner.logStep(
        '验证会话状态',
        statusResponse.data?.status === 'active',
        'active',
        statusResponse.data?.status
      );

    } catch (error) {
      this.runner.logError(error);
    }

    this.runner.endTest();
  }
}

// 导出测试工具
window.TestRunner = TestRunner;
window.AuthTestSuite = AuthTestSuite;
window.StudentRecordsTestSuite = StudentRecordsTestSuite;
window.ScoringTestSuite = ScoringTestSuite;
window.StatisticsTestSuite = StatisticsTestSuite;
window.StudentAnswerTestSuite = StudentAnswerTestSuite;
window.AnswerProcessTestSuite = AnswerProcessTestSuite;

// 全局测试实例
window.testRunner = new TestRunner();
window.authTests = new AuthTestSuite(window.testRunner);
window.studentRecordsTests = new StudentRecordsTestSuite(window.testRunner);
window.scoringTests = new ScoringTestSuite(window.testRunner);
window.statisticsTests = new StatisticsTestSuite(window.testRunner);
window.studentAnswerTests = new StudentAnswerTestSuite(window.testRunner);
window.answerProcessTests = new AnswerProcessTestSuite(window.testRunner);

console.log('🧪 测试工具已加载，可在浏览器控制台中使用以下命令:');
console.log('- authTests.testAdminLogin()    // 测试管理员登录');
console.log('- authTests.testStudentLogin()    // 测试考生登录');
console.log('- studentRecordsTests.testRecordsList()    // 测试答题记录列表');
console.log('- studentRecordsTests.testRecordDetail()    // 测试答题记录详情');
console.log('- studentRecordsTests.testRecordStats()     // 测试答题统计信息');
console.log('- scoringTests.testGetNeedScoringRecords()     // 测试获取待评分记录列表');
console.log('- scoringTests.testSubmitScoring()     // 测试提交评分');
console.log('- statisticsTests.testDashboardStats()     // 测试仪表盘统计数据');
console.log('- statisticsTests.testTrendData()     // 测试趋势数据');
console.log('- statisticsTests.testQuestionStats()     // 测试题目统计数据');
console.log('- studentAnswerTests.testCreateAnswerSession()     // 测试创建答题会话');
console.log('- studentAnswerTests.testGetQuestions()     // 测试获取题目列表');
console.log('- studentAnswerTests.testSubmitAnswer()     // 测试提交答案');
console.log('- studentAnswerTests.testDifferentQuestionTypes()     // 测试不同题型答题');
console.log('- answerProcessTests.testProgressControl()     // 测试答题进度控制');
console.log('- answerProcessTests.testTimeManagement()     // 测试时间管理');
console.log('- answerProcessTests.testSessionKeepAlive()     // 测试会话保持');
console.log('- testRunner.generateReport()    // 生成测试报告'); 