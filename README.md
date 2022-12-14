# Music Streaming Web Application
> Music streaming service developed as part of the engineering thesis project.

## Table of Contents
* [About](#about)
* [Technologies](#technologies)
* [Features](#features)
* [Setup](#setup)
* [Prerequisites](#prerequisites)

## About
As part of the engineering thesis project we developed a music streaming application. Although it is not perfect and still needs some enhancments it has most of the expected functionalities. Images below present couple of the pages from the application:

### Library page
![image](https://user-images.githubusercontent.com/43424109/207547560-ea5a1012-8b95-4514-b89a-899e94a51590.png)
### User profile page
![image](https://user-images.githubusercontent.com/43424109/207548713-0da10827-2310-4469-a8b0-e70de6b3294b.png)
### Playlist page
![image](https://user-images.githubusercontent.com/43424109/207549201-f565142a-8292-43a5-b1c4-485dbda82764.png)


## Technologies
- Python
- FastAPI
- Angular
- Angular Material
- Mongo
- Docker


## Features
Main available features:
- account management
- song queue management
- audio player
- library page
- add and remove content from library
- create and edit playlists
- playlist pages
- user pages
- view and edit profile
- album pages
- artist pages
- search functionality

## Prerequisites
- Docker -> see https://docs.docker.com/get-docker/
- Docker Compose -> see https://docs.docker.com/compose/install/

## Setup
Run the application from the root directory (directory with docker-compose.yml) with the following command:
```
docker compose up
```
After successful docker deployment the application should be available at http://localhost:4200/
