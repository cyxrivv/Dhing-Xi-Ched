-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: ecommerce
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'cpu'),(2,'gpu'),(3,'ram'),(4,'storage'),(5,'motherboard'),(6,'psu'),(7,'cooling'),(8,'case'),(9,'peripherals');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_methods`
--

DROP TABLE IF EXISTS `payment_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_methods` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `method_name` varchar(50) NOT NULL,
  PRIMARY KEY (`payment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_methods`
--

LOCK TABLES `payment_methods` WRITE;
/*!40000 ALTER TABLE `payment_methods` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `stock` int NOT NULL,
  `category_id` int DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `badge` varchar(50) DEFAULT NULL,
  `old_price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'AMD Ryzen 9 7950X','16-core, 32-thread desktop processor. Dominate every workload.',32999.00,10,1,'ryzen-9.jpg','Hot',38999.00),(2,'Intel Core i9-14900K','24-core unlocked desktop processor for extreme performance.',29999.00,10,1,'intelcore-i9.jpg','Sale',34999.00),(3,'AMD Ryzen 5 7600X','Best mid-range CPU for gaming and everyday tasks.',12999.00,10,1,'product3.jpg','New',NULL),(4,'NVIDIA RTX 4090','Flagship GPU. 4K gaming, ray tracing, and AI — redefined.',89999.00,10,2,'product1.jpg','Hot',99999.00),(5,'AMD RX 7900 XTX','AMD top-tier RDNA 3 card with 24GB GDDR6.',54999.00,10,2,'product2.jpg','Sale',62999.00),(6,'NVIDIA RTX 4070 Ti','High-end 1440p and 4K gaming.',44999.00,10,2,'product3.jpg','New',NULL),(7,'Corsair Vengeance DDR5 32GB','DDR5-5600 kit with low latency.',8499.00,10,3,'product1.jpg','Sale',9999.00),(8,'G.Skill Trident Z5 RGB 64GB','64GB DDR5 kit for creators.',16999.00,10,3,'product2.jpg','New',NULL),(9,'Kingston Fury Beast DDR4 16GB','Reliable DDR4-3200 memory.',3499.00,10,3,'product3.jpg',NULL,4299.00),(10,'Samsung 990 Pro 2TB NVMe','PCIe 4.0 NVMe SSD — blazing-fast reads up to 7,450 MB/s.',9999.00,10,4,'product1.jpg','Sale',12499.00),(11,'WD Black SN850X 1TB','PCIe 4.0 SSD optimized for gaming with sustained speeds.',5499.00,10,4,'product2.jpg','New',NULL),(12,'Seagate Barracuda 4TB HDD','Affordable high-capacity storage for backups and media.',3999.00,10,4,'product3.jpg',NULL,4999.00),(13,'ASUS ROG Maximus Z790','Flagship Z790 board with full DDR5 and PCIe 5.0 support.',24999.00,10,5,'product1.jpg','Hot',28999.00),(14,'MSI MAG X670E Tomahawk','Feature-packed AM5 board for Ryzen 7000 series CPUs.',16999.00,10,5,'product2.jpg','New',NULL),(15,'Gigabyte B650 Aorus Elite','Great mid-range AM5 board with solid VRM and connectivity.',11499.00,10,5,'product3.jpg','Sale',13499.00),(16,'Corsair RM1000x 1000W','80+ Gold fully modular PSU — silent and reliable.',9499.00,10,6,'product1.jpg','Sale',10999.00),(17,'EVGA SuperNOVA 850W G7','80+ Gold modular PSU with a 10-year warranty.',7499.00,10,6,'product2.jpg',NULL,NULL),(18,'Seasonic Focus GX-750W','Gold-rated fully modular PSU built to last.',5999.00,10,6,'product3.jpg','New',6999.00),(19,'Noctua NH-D15 Air Cooler','Legendary dual-tower air cooler — near-silent operation.',5499.00,10,7,'product1.jpg',NULL,NULL),(20,'NZXT Kraken 360 AIO','360mm liquid cooler with RGB pump head and quiet fans.',10999.00,10,7,'product2.jpg','Sale',12999.00),(21,'Lian Li Galahad 240 AIO','Premium 240mm AIO with addressable RGB fans.',7999.00,10,7,'product3.jpg','New',NULL),(22,'Lian Li PC-O11 Dynamic EVO','Iconic dual-chamber case with excellent airflow and aesthetics.',8999.00,10,8,'product1.jpg','Hot',9999.00),(23,'Fractal Design Torrent','Airflow-focused mid-tower with massive front intake fans.',7499.00,10,8,'product2.jpg',NULL,NULL),(24,'NZXT H9 Flow','Panoramic dual-chamber design with tempered glass all around.',9499.00,10,8,'product3.jpg','Sale',10999.00),(25,'Logitech G Pro X Superlight 2','Ultra-lightweight wireless gaming mouse — 60g, HERO 2 sensor.',5999.00,10,9,'product1.jpg','Hot',6999.00),(26,'Keychron Q1 Pro Mechanical','QMK/VIA wireless mechanical keyboard with aluminum body.',7499.00,10,9,'product2.jpg','New',NULL),(27,'Samsung Odyssey G7 32 QHD','240Hz curved QHD gaming monitor with 1ms response time.',29999.00,10,9,'product3.jpg','Sale',35999.00);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'ced','cedrickarmia6@gmail.com','$2b$12$h7WBT6hg4VilU2TDAik4ce1ibCE.yEPopwRZ49vIKHnbWD0Wu/OD6');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-19  3:02:36
