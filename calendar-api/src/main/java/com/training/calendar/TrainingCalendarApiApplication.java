package com.training.calendar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TrainingCalendarApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(TrainingCalendarApiApplication.class, args);
	}

}
