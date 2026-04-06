package com.cosmetics;

import com.cosmetics.model.Order;
import com.cosmetics.model.User;
import com.cosmetics.repository.OrderRepository;
import com.cosmetics.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

import java.time.LocalDateTime;

@SpringBootApplication
@EnableMongoAuditing
public class CosmeticsApplication {

	public static void main(String[] args) {
		SpringApplication.run(CosmeticsApplication.class, args);
	}

	@Bean
	public CommandLineRunner fixDbDates(OrderRepository orderRepository, UserRepository userRepository, com.cosmetics.repository.ProductRepository productRepository) {
		return args -> {
			for (Order order : orderRepository.findAll()) {
				if (order.getCreatedAt() == null) {
					order.setCreatedAt(LocalDateTime.now().minusDays(1));
					order.setUpdatedAt(LocalDateTime.now());
					orderRepository.save(order);
				}
			}
			for (User user : userRepository.findAll()) {
				if (user.getCreatedAt() == null) {
					user.setCreatedAt(LocalDateTime.now().minusDays(2));
					user.setUpdatedAt(LocalDateTime.now());
					userRepository.save(user);
				}
			}
			for (com.cosmetics.model.Product p : productRepository.findAll()) {
				boolean changed = false;
				if (p.getIsActive() == null) {
					p.setIsActive(true);
					changed = true;
				}
				if (p.getSoldCount() == null || p.getSoldCount() == 0) {
					int fakeSales = (p.getName() != null ? p.getName().length() : 10) * 3 % 45 + 5;
					p.setSoldCount(fakeSales);
					changed = true;
				}
				if (changed) {
					productRepository.save(p);
				}
			}
		};
	}
}
