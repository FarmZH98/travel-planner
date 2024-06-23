DROP DATABASE IF EXISTS travel;
CREATE DATABASE travel;
USE travel;

DROP TABLE IF EXISTS user;
CREATE TABLE user (
	id int auto_increment not null,
    username varchar(128),
    password varchar(128),
    email varchar(128),
	firstname varchar(128),
    lastname varchar(128),
    gender varchar(128),
    token varchar(128) unique,
    constraint primary key (id));
    