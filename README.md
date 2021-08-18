# Productivity Organizer Server

Server for Productivity Organizer. 

Demo: https://youtu.be/XqckdVZZMdw

Server repository: https://github.com/AungKMin/productivity-organizer-server 

Client repository: https://github.com/AungKMin/productivity-organizer-client

Application hosted here: https://productivity-organizer.netlify.app

**Used technologies:** *Node.js, Express, MongoDB, JSON Web Token*

## Description

Productivity Organizer is a note-taking application with social-media-inspired features like commenting, tags, and a "similar notes" feature. This repository contains the code for Productivity Organizer's REST API. 

### Server Features include
* user authentication
* user authorization for creating, updating, deleting, and viewing posts 
* JSON Web Token user sign-in sessions
* searching posts by keywords and tags 

## Getting Started

### Requirements

* Node
* MongoDB (MongoDB Atlas or a local server)

### Installation
In both the client and server folders, run:
```
npm install
```

### Executing program
Ensure a local MongoDB server is running. The default port is `localhost:27017`. In both the server and client folders, run: 
```
npm start
```

## License

This project is licensed under the MIT License - see the LICENSE.md file for details