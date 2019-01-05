# One-page TurtlePay

This is a one page app to create apps or sell products accepting TRTL via TurtlePay, check out a live version at [https://whosent10turtles.info](https://whosent10turtles.info/)

### Installation

Install the dependencies and start the server.

1) Clone this repo with `git clone https://github.com/mrrovot/one-page-turtlepay.git`
1) cd into it and install all dependenciens with `npm install`
1) run `npm run start` to start the server at port `8095`

## Architecture
The main files are `/views/index.hbs` and  `/routes/index.js`, check out the comments in `index.js` to see where you type your TRTL wallet and the price for your product, the rest will work out of the box.

The site is using a `db.json` file as database so you don't have to run your own database for one page shops or applications,  it redirects clients that paid to `thankyou.hbs` where they can see private content.

The css framework I used is [TailWindCSS](https://tailwindcss.com/), I recommend it, is for people that don't enjoy writing css!

Feel free to contribute or report any bugs, this is work in progress V.0.1

Donations accepted: **TRTLv2n21XRdNr43DAp7WXYMm3MBcS9n8ZTsDcmZ7WVdM4J9uSTWsYAEFoWyvRCcgVesyGBjYkD4qF67R7R4odSQf7n7iE58hV6**