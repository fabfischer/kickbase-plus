# Kickbase+

## About project
this is a "quick and dirty" web client for KICKBASE, which provides all main features like:

- switching between leagues
- feed/news listing
- transfer market
- accept offers
- line-up for next matchday
- league ranking
- live ranking

kickbase+ supports all devices - means it is responsive.

## Extended features

it offers some additional features compared to the official mobile ~~and web app~~, such as:
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

## Demo
you can test the app here: [https://kickbaseplus.fabian-fischer.com/](https://kickbaseplus.fabian-fischer.com/)

(no tracking, no storing of your credentials. after a successful login, the login token is stored in your browser via LocalStorage. this information is therefore saved ONLY LOCALLY in your browser!)

alternatively you can just check out these fancy gifs (which show an old version of the application):

![first demo of kickbase+](https://dev.fabian-fischer.com/github/kickbase+/demo-1.gif "first demo of kickbase+")


![second demo of kickbase+](https://dev.fabian-fischer.com/github/kickbase+/demo-2.gif "second demo of kickbase+")

## Download and usage
just clone this project on your computer and follow the instructions below. 

You can also download the compiled zip here:

[https://github.com/fabfischer/kickbase-plus/releases](https://github.com/fabfischer/kickbase-plus/releases)


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

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center"><a href="https://github.com/ismailoezcan"><img src="https://avatars.githubusercontent.com/u/32710563?v=4" width="100px;" alt=""/><br /><sub><b>ismailoezcan</b></sub></a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## Credits

- Fabian Fischer, initiator ([buy me a coffee](https://www.buymeacoffee.com/ffischer),
  github: [@fabfischer](https://github.com/fabfischer), twitter: [@ffischer](https://twitter.com/ffischer))
- Jayesh Vachhani, for his [vue-numeric-input](https://github.com/JayeshLab/vue-numeric-input), which we are using in a
  modified version
- Dipak Sarkar, for his [vue-number-format](https://github.com/coders-tm/vue-number-format/tree/vue2.0), which we are using in combination with
  vue-numeric-input in an adapted version

## License

The MIT License (MIT). Please see License File for more information.