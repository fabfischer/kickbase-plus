# kickbase+

## about project
this is a "quick and dirty" web client for KICKBASE, which provides all main features like:

- switching between leagues
- feed/news listing
- transfer market
- accept offers
- line-up for next matchday
- league ranking
- live ranking

kickbase+ supports all devices - means it is responsive.

## extended features

it offers some additional features compared to the official mobile and web app, such as:
- no ads
- automatic fetching of daily bonus
- transfer market:
	- market price trends of the last few days are directly visible
	- see if other users bid on a player
	- dedicated buttons which let you send an offer with one click
	- indication of how many more players you can buy (if your league has a player limit for teams)
- offers by Kickbase:
	- accept or reject offers from Kickbase with just one click
- line-up:
	- see which player is suspended or injured
	- see which player will play against which team on the next matchday
- live stats: you can see you current ranking of each matchday live


⚠️ please note that the transfer market and all own offers are limited to deals made by Kickbase (system). You can't sell or buy players from other users in the league at this time! ⚠️ 

## demo
you can test the app here: [https://kickbaseplus.fabian-fischer.com/](https://kickbaseplus.fabian-fischer.com/)

(no tracking, no storing of your credentials. after a successful login, the login token is stored in your browser via LocalStorage. this information is therefore saved ONLY LOCALLY in your browser!)

as an alternative you can also just look at this fancy gifs:

![first demo of kickbase+](https://dev.fabian-fischer.com/github/kickbase+/demo-1.gif "first demo of kickbase+")


![second demo of kickbase+](https://dev.fabian-fischer.com/github/kickbase+/demo-2.gif "second demo of kickbase+")

## download and usage
just clone this project on your computer and follow the instructions below. 

You can also download the compiled zip here:

## project setup
tested with node v14


to install all dependencies just run:

```
npm install
```

to compile the source code execute the following:
 
```
npm run build
```

if you wish to change or extend some code, you can use the following for development (with hot-reloads)

```
npm run serve
```

## credits
Fabian Fischer ([buy me a coffee](https://www.buymeacoffee.com/ffischer), github: [@fabfischer](https://github.com/fabfischer), twitter: [@ffischer](https://twitter.com/ffischer))