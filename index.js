var express = require('express');
var fs = require('fs');
var request = require('request-promise');
var cheerio = require('cheerio');
var app     = express();

app.get('/scrape', function(req, res){
	var district = req.query.district || 1;

	console.log("Scrape started");
	// you can go to the url and check the post payload to have a better understanding of how this works.
	var options = {
	    method: 'POST',
	    uri: 'http://postapaletta.avangrade.com/Elfogadohelyek',
	    body: {
			typeSelector:"CompanyState",
			Zip:"",
			City:"Budapest",
			District: district,
			Company:"",
			ByPosition:"",
			PositionDistance:"5000",
			Longitude:"",
			Latitude:"",
			Category_all:"on",
			"Category[0]":"false",
			"Category[1]":"false",
			"Category[2]":"false",
			"Category[3]":"false",
			"Category[4]":"false",
			HasResult:"true",
			SearchType:"CompanyState"
	    },
	    json: true
	};

	request(options).then(function(html, error) {
		console.log("Loaded...");
		if(!error){
			var $ = cheerio.load(html);
			var json = [];
			
			$('.resultItem').each(function(i, elem) {
				var mapdata = $(elem).find('.map_data');
				
				var types = mapdata.attr('data-store-type').split(",");
				var geo = {
					"long": mapdata.attr('data-geo-long'),
					"lat": mapdata.attr('data-geo-lat')
				};

				json.push({
					'name': mapdata.attr('data-store-name'),
					'address': mapdata.attr('value'),
					'geo': geo,
					'type': types,
					'city': 'Budapest',
					'district': district
				});
			});

			console.log("Done.");
			res.send(json);
		};
	});
});

app.use(express.static(__dirname + '/'));

app.listen('8081');
exports = module.exports = app;
console.log('app initialized on 8081');