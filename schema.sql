DROP TABLE IF EXISTS `counting_state`;
CREATE TABLE `counting_state` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `channel_id` varchar(32) NOT NULL,
  `current_count` int(11) NOT NULL DEFAULT 0,
  `last_user_id` varchar(32) DEFAULT NULL,
  `last_message_id` varchar(32) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `channel_id` (`channel_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
