package com.gujian.questionnaire;

import com.gujian.questionnaire.service.UserService;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("com.gujian.questionnaire.mapper")
@EnableScheduling
public class QuestionnaireSystemApplication implements CommandLineRunner {

    @Autowired
    private UserService userService;

    public static void main(String[] args) {
        SpringApplication.run(QuestionnaireSystemApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        // 初始化默认管理员账户
        userService.initDefaultAdmin();
        System.out.println("默认管理员账户已初始化: admin/admin123");
    }
}
