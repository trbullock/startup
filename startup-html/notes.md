# CS 260 Notes

This file represents what I have learned about web programming.
I love web programming

- [My startup](https://startup.cs260.click)
- [My simon](https://simon.cs260.click)

## Helpful links

- [Course instruction](https://github.com/webprogramming260)
- [Canvas](https://byu.instructure.com)
- [MDN](https://developer.mozilla.org)

## Git

So far I have learned how I am able to commit things into my github repository

## AWS

The collection of technologies that you use to create or deliver your web application is called a technology stack. Here is what my technology stack looks like: React for the web framework, talking to Caddy as the web server hosted on AWS, running web services with Node.js, and MongoDB as the database hosted on MongoDB Atlas.

## HTML

When writing HTML just make sure that you get everything that you want on the screen. You will be able to style it later using CSS. It is much easier if you get all the HTML done before you start doing anything else like styling.

## CSS

In CSS there are frameworks that can make it much easier to style the website. The most popular one as of right now is Tailwind, however, it is much easier to learn Bootstrap. I can also use flex to make sure that the webpage will adjust based on how big the screen is.

## React

When starting you need to setup NPM and initialise Vite inside your enviornment using the following commands:
npm init -y
npm install vite@latest -D
Next you need to replace the scripts section inside of package.json with the follwing code:
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }

