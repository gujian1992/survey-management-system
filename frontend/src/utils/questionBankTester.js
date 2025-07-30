/**
 * 题库管理功能测试工具
 */

class QuestionBankTestSuite {
  constructor(testRunner) {
    this.runner = testRunner;
    this.adminToken = null;
  }

  // 设置管理员Token
  setAdminToken(token) {
    this.adminToken = token;
  }

  // TC003.1 - 题库列表查询测试
  async testQuestionBankList() {
    this.runner.startTest('TC003.1', '题库列表查询测试');

    try {
      if (!this.adminToken) {
        throw new Error('需要管理员Token');
      }

      const response = await this.runner.apiTest('/question-bank/list', 'GET', null, {
        'Authorization': `Bearer ${this.adminToken}`
      });

      // 验证响应状态
      this.runner.logStep(
        '验证HTTP状态码',
        response.status === 200,
        '200',
        response.status
      );

      // 验证响应结构
      if (response.data) {
        this.runner.logStep(
          '验证响应结构',
          !!response.data.data,
          '有data字段',
          response.data.data ? '有data字段' : '无data字段'
        );

        if (response.data.data) {
          this.runner.logStep(
            '验证数据类型',
            Array.isArray(response.data.data),
            '数组类型',
            Array.isArray(response.data.data) ? '数组类型' : '非数组类型'
          );
        }
      }

    } catch (error) {
      this.runner.logError(error);
    }

    this.runner.endTest();
  }

  // TC003.2 - 创建题目测试
  async testCreateQuestion() {
    this.runner.startTest('TC003.2', '创建题目测试');

    try {
      if (!this.adminToken) {
        throw new Error('需要管理员Token');
      }

      const questionData = {
        content: `测试题目 - ${new Date().getTime()}`,
        type: 'SINGLE_CHOICE',
        options: ['选项A', '选项B', '选项C', '选项D'],
        correctAnswer: '0',
        explanation: '这是一道测试题目',
        difficulty: 'MEDIUM',
        subject: '计算机科学',
        tags: ['测试', '自动化']
      };

      const response = await this.runner.apiTest('/question-bank', 'POST', questionData, {
        'Authorization': `Bearer ${this.adminToken}`
      });

      // 验证响应状态
      this.runner.logStep(
        '验证HTTP状态码',
        response.status === 200,
        '200',
        response.status
      );

      // 验证创建成功
      if (response.data) {
        this.runner.logStep(
          '验证创建成功',
          response.data.success === true,
          'true',
          response.data.success
        );

        // 如果创建成功，保存题目ID供后续测试使用
        if (response.data.success && response.data.data) {
          this.createdQuestionId = response.data.data.id || response.data.data;
          this.runner.logStep(
            '保存题目ID',
            !!this.createdQuestionId,
            '有题目ID',
            this.createdQuestionId ? `ID: ${this.createdQuestionId}` : '无ID'
          );
        }
      }

    } catch (error) {
      this.runner.logError(error);
    }

    this.runner.endTest();
  }

  // TC003.3 - 题目搜索测试
  async testSearchQuestions() {
    this.runner.startTest('TC003.3', '题目搜索测试');

    try {
      if (!this.adminToken) {
        throw new Error('需要管理员Token');
      }

      // 测试按内容搜索
      const searchResponse = await this.runner.apiTest('/question-bank/search?keyword=测试', 'GET', null, {
        'Authorization': `Bearer ${this.adminToken}`
      });

      this.runner.logStep(
        '搜索功能状态码',
        searchResponse.status === 200,
        '200',
        searchResponse.status
      );

      // 测试按难度筛选
      const filterResponse = await this.runner.apiTest('/question-bank/list?difficulty=MEDIUM', 'GET', null, {
        'Authorization': `Bearer ${this.adminToken}`
      });

      this.runner.logStep(
        '筛选功能状态码',
        filterResponse.status === 200,
        '200',
        filterResponse.status
      );

    } catch (error) {
      this.runner.logError(error);
    }

    this.runner.endTest();
  }

  // TC003.4 - 题目编辑测试
  async testEditQuestion() {
    this.runner.startTest('TC003.4', '题目编辑测试');

    try {
      if (!this.adminToken) {
        throw new Error('需要管理员Token');
      }

      if (!this.createdQuestionId) {
        this.runner.logStep(
          '跳过编辑测试',
          false,
          '需要先创建题目',
          '没有可编辑的题目ID'
        );
        this.runner.endTest();
        return;
      }

      const updateData = {
        content: `更新的测试题目 - ${new Date().getTime()}`,
        explanation: '这是更新后的解释'
      };

      const response = await this.runner.apiTest(`/question-bank/${this.createdQuestionId}`, 'PUT', updateData, {
        'Authorization': `Bearer ${this.adminToken}`
      });

      this.runner.logStep(
        '验证编辑状态码',
        response.status === 200,
        '200',
        response.status
      );

      if (response.data) {
        this.runner.logStep(
          '验证编辑成功',
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

  // TC003.5 - 批量操作测试
  async testBatchOperations() {
    this.runner.startTest('TC003.5', '批量操作测试');

    try {
      if (!this.adminToken) {
        throw new Error('需要管理员Token');
      }

      // 测试批量删除（先测试API是否存在）
      const batchDeleteResponse = await this.runner.apiTest('/question-bank/batch-delete', 'POST', {
        ids: [] // 空数组，不实际删除
      }, {
        'Authorization': `Bearer ${this.adminToken}`
      });

      this.runner.logStep(
        '批量删除接口可用',
        batchDeleteResponse.status !== 404,
        '非404状态',
        batchDeleteResponse.status
      );

      // 测试批量导入接口
      const batchImportResponse = await this.runner.apiTest('/question-bank/import', 'POST', {
        questions: [] // 空数组测试
      }, {
        'Authorization': `Bearer ${this.adminToken}`
      });

      this.runner.logStep(
        '批量导入接口可用',
        batchImportResponse.status !== 404,
        '非404状态',
        batchImportResponse.status
      );

    } catch (error) {
      this.runner.logError(error);
    }

    this.runner.endTest();
  }

  // TC003.6 - 权限验证测试
  async testPermissions() {
    this.runner.startTest('TC003.6', '题库管理权限测试');

    try {
      // 测试无Token访问
      const noTokenResponse = await this.runner.apiTest('/question-bank/list', 'GET');

      this.runner.logStep(
        '无Token访问被拒绝',
        noTokenResponse.status === 401 || noTokenResponse.status === 403,
        '401或403',
        noTokenResponse.status
      );

      // 如果有考生Token，测试考生权限
      // 这里可以扩展测试考生访问管理员接口的情况

    } catch (error) {
      this.runner.logError(error);
    }

    this.runner.endTest();
  }

  // 运行所有题库测试
  async runAllTests() {
    const tests = [
      'testQuestionBankList',
      'testCreateQuestion', 
      'testSearchQuestions',
      'testEditQuestion',
      'testBatchOperations',
      'testPermissions'
    ];

    for (const testMethod of tests) {
      await this[testMethod]();
      await new Promise(resolve => setTimeout(resolve, 1000)); // 间隔1秒
    }
  }
}

// 答题会话管理测试套件
class AnswerSessionTestSuite {
  constructor(testRunner) {
    this.runner = testRunner;
    this.adminToken = null;
  }

  setAdminToken(token) {
    this.adminToken = token;
  }

  // TC004.1 - 会话列表查询测试
  async testSessionList() {
    this.runner.startTest('TC004.1', '答题会话列表查询测试');

    try {
      if (!this.adminToken) {
        throw new Error('需要管理员Token');
      }

      const response = await this.runner.apiTest('/answer-sessions', 'GET', null, {
        'Authorization': `Bearer ${this.adminToken}`
      });

      this.runner.logStep(
        '验证HTTP状态码',
        response.status === 200,
        '200',
        response.status
      );

      if (response.data && response.data.data) {
        this.runner.logStep(
          '验证数据结构',
          Array.isArray(response.data.data),
          '数组类型',
          Array.isArray(response.data.data) ? '数组类型' : typeof response.data.data
        );
      }

    } catch (error) {
      this.runner.logError(error);
    }

    this.runner.endTest();
  }

  // TC004.2 - 创建答题会话测试
  async testCreateSession() {
    this.runner.startTest('TC004.2', '创建答题会话测试');

    try {
      if (!this.adminToken) {
        throw new Error('需要管理员Token');
      }

      const sessionData = {
        title: `测试会话 - ${new Date().getTime()}`,
        description: '这是一个自动化测试创建的会话',
        timeLimit: 60,
        questionIds: [], // 空题目列表用于测试
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await this.runner.apiTest('/answer-sessions', 'POST', sessionData, {
        'Authorization': `Bearer ${this.adminToken}`
      });

      this.runner.logStep(
        '验证创建状态码',
        response.status === 200,
        '200',
        response.status
      );

      if (response.data && response.data.success) {
        this.createdSessionId = response.data.data?.id;
        this.runner.logStep(
          '验证创建成功',
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

  // TC004.3 - 会话状态管理测试
  async testSessionStatusManagement() {
    this.runner.startTest('TC004.3', '会话状态管理测试');

    try {
      if (!this.adminToken || !this.createdSessionId) {
        this.runner.logStep(
          '跳过状态管理测试',
          false,
          '需要有效会话ID',
          '无可操作的会话'
        );
        this.runner.endTest();
        return;
      }

      // 测试状态更新
      const statusResponse = await this.runner.apiTest(`/answer-sessions/${this.createdSessionId}/status`, 'PUT', {
        status: 'ACTIVE'
      }, {
        'Authorization': `Bearer ${this.adminToken}`
      });

      this.runner.logStep(
        '状态更新API可用',
        statusResponse.status !== 404,
        '非404状态',
        statusResponse.status
      );

    } catch (error) {
      this.runner.logError(error);
    }

    this.runner.endTest();
  }

  async runAllTests() {
    const tests = [
      'testSessionList',
      'testCreateSession',
      'testSessionStatusManagement'
    ];

    for (const testMethod of tests) {
      await this[testMethod]();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// 导出测试工具
window.QuestionBankTestSuite = QuestionBankTestSuite;
window.AnswerSessionTestSuite = AnswerSessionTestSuite;

console.log('🧪 题库和会话测试工具已加载');
console.log('使用方法:');
console.log('1. const qbTests = new QuestionBankTestSuite(testRunner)');
console.log('2. qbTests.setAdminToken("your-token")');
console.log('3. qbTests.runAllTests()'); 