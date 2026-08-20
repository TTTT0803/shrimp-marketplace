-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.32-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.7.0.6850
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for shrimp_marketplace
CREATE DATABASE IF NOT EXISTS `shrimp_marketplace` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `shrimp_marketplace`;

-- Dumping structure for table shrimp_marketplace.ai_analysis
CREATE TABLE IF NOT EXISTS `ai_analysis` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `lot_id` bigint(20) NOT NULL,
  `model_name` varchar(100) DEFAULT NULL,
  `model_version` varchar(50) DEFAULT NULL,
  `shrimp_count` int(11) DEFAULT NULL,
  `confidence` decimal(5,2) DEFAULT NULL,
  `quality_grade` varchar(50) DEFAULT NULL,
  `average_size` decimal(10,2) DEFAULT NULL,
  `processing_time` decimal(10,2) DEFAULT NULL,
  `ai_result` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ai_result`)),
  `analyzed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `lot_id` (`lot_id`),
  CONSTRAINT `ai_analysis_ibfk_1` FOREIGN KEY (`lot_id`) REFERENCES `shrimp_lots` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table shrimp_marketplace.blockchain_records
CREATE TABLE IF NOT EXISTS `blockchain_records` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `lot_id` bigint(20) NOT NULL,
  `network` varchar(50) DEFAULT NULL,
  `smart_contract` varchar(255) DEFAULT NULL,
  `transaction_hash` varchar(255) DEFAULT NULL,
  `block_number` bigint(20) DEFAULT NULL,
  `metadata_hash` varchar(255) DEFAULT NULL,
  `status` enum('PENDING','CONFIRMED') DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `lot_id` (`lot_id`),
  CONSTRAINT `blockchain_records_ibfk_1` FOREIGN KEY (`lot_id`) REFERENCES `shrimp_lots` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table shrimp_marketplace.escrow_transactions
CREATE TABLE IF NOT EXISTS `escrow_transactions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) NOT NULL,
  `contract_address` varchar(255) DEFAULT NULL,
  `tx_lock` varchar(255) DEFAULT NULL,
  `tx_release` varchar(255) DEFAULT NULL,
  `escrow_amount` decimal(15,2) DEFAULT NULL,
  `gas_fee` decimal(15,6) DEFAULT NULL,
  `network` varchar(50) DEFAULT NULL,
  `status` enum('LOCKED','RELEASED','REFUNDED') DEFAULT NULL,
  `locked_at` timestamp NULL DEFAULT NULL,
  `released_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `escrow_transactions_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table shrimp_marketplace.ipfs_metadata
CREATE TABLE IF NOT EXISTS `ipfs_metadata` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `lot_id` bigint(20) NOT NULL,
  `cid` varchar(255) DEFAULT NULL,
  `metadata_uri` text DEFAULT NULL,
  `video_cid` varchar(255) DEFAULT NULL,
  `image_cid` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `lot_id` (`lot_id`),
  CONSTRAINT `ipfs_metadata_ibfk_1` FOREIGN KEY (`lot_id`) REFERENCES `shrimp_lots` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table shrimp_marketplace.lot_media
CREATE TABLE IF NOT EXISTS `lot_media` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `lot_id` bigint(20) NOT NULL,
  `media_type` enum('IMAGE','VIDEO') DEFAULT NULL,
  `file_url` text DEFAULT NULL,
  `thumbnail_url` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `lot_id` (`lot_id`),
  CONSTRAINT `lot_media_ibfk_1` FOREIGN KEY (`lot_id`) REFERENCES `shrimp_lots` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table shrimp_marketplace.orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `lot_id` bigint(20) NOT NULL,
  `buyer_id` bigint(20) NOT NULL,
  `quantity` decimal(10,2) DEFAULT NULL,
  `total_amount` decimal(15,2) DEFAULT NULL,
  `currency` varchar(10) DEFAULT NULL,
  `status` enum('PENDING','ESCROW','SHIPPING','DELIVERED','COMPLETED','CANCELLED') DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `lot_id` (`lot_id`),
  KEY `buyer_id` (`buyer_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`lot_id`) REFERENCES `shrimp_lots` (`id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table shrimp_marketplace.reviews
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) NOT NULL,
  `buyer_id` bigint(20) NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` between 1 and 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `buyer_id` (`buyer_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table shrimp_marketplace.shrimp_lots
CREATE TABLE IF NOT EXISTS `shrimp_lots` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `farmer_id` bigint(20) NOT NULL,
  `lot_code` varchar(50) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `shrimp_type` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT NULL,
  `unit` varchar(20) DEFAULT NULL,
  `price` decimal(15,2) DEFAULT NULL,
  `currency` varchar(10) DEFAULT NULL,
  `harvest_date` date DEFAULT NULL,
  `origin` varchar(255) DEFAULT NULL,
  `status` enum('DRAFT','AI_ANALYZED','LISTED','LOCKED','SOLD','COMPLETED') DEFAULT 'DRAFT',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `lot_code` (`lot_code`),
  KEY `farmer_id` (`farmer_id`),
  CONSTRAINT `shrimp_lots_ibfk_1` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table shrimp_marketplace.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('ADMIN','FARMER','BUYER') NOT NULL,
  `wallet_address` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
