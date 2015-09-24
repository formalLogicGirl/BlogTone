/**
 * Copyright 2015. All Rights Reserved. Swaha Miller.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var watson = require('watson-developer-cloud');
var config = require('./config');
var https = require('https');

var bloggerConfig = config.blogger;
var host = bloggerConfig.host;
var blogIdReadFrom = bloggerConfig.blog_id_read_from;
var postId = bloggerConfig.post_id;
var apiKey = bloggerConfig.api_key;
var blogIdWriteTo = bloggerConfig.blog_id_write_to;
var accessToken = bloggerConfig.access_token;
var fields = '&fields=url,title,content,labels';
var path = '/blogger/v3/blogs/' + blogIdReadFrom + '/posts/' + postId + '?key=' + apiKey;

var toneAnalyzer = watson.tone_analyzer({
  version: 'v1',
  username: 'e36a3037-b3f6-40d0-9c40-c5d4ee274277',
  password: 'skzoNAmkClT6'
});

var addNewBlog = true;
var resultToConsole = true;

function getContent(host, path, process_content) {
    var options = {
        host: host,
        path: path
    };

    console.log(bloggerConfig);
    console.log(bloggerConfig[0]);
    console.log('api_key : ', apiKey);
    console.log('Making https request :', host + path);
    
    https.get(options, function(res) {
	res.setEncoding('utf-8');
	var data = "";
	res.on('data', function (next_chunk) {
	    data += next_chunk;
	});
	res.on('end', function() {
	    process_content(data);
	});
    }).on('error', function() {
	process_content(null);
    });
}

function postToBlog(host, blogIdWriteTo, title, content, accessToken) {
    // TODO Implement OAuth2 to get access token.
    // Request authorization
    // If authorization granted, request access token    
    // Send post request with access token
    
    // For now, obtain OAuth2 access token on Blogger and add to config
    var options = {
	host: host,
	path: '/blogger/v3/blogs/'+ blogIdWriteTo + '/posts/',
	method: 'POST',
	headers: {
	    'Authorization' : 'Bearer ' + accessToken,
	    'Content-Type' : 'application/json'
	}
    };
    
    var postJson = {
	'kind' : 'blogger#post',
	'blog' : {
	    'id' : blogIdWriteTo
	},
	'title' : title,
	'content' : content,
	'labels' : ['automated', 'tech', 'Watson']
    };

    var req = https.request(options, function(res) {
	console.log('status code: ', res.statusCode);
	console.log('headers: ', res.headers);
    });
    req.write(JSON.stringify(postJson));
    req.end();
    req.on('error', function(err) {
	console.log('Error in POST response : ', err);
    });
}


function processData (data) {
    if (data) {
	console.log(data);
	// Convert json response to text
	var dataObject = JSON.parse(data);
	//console.log(dataObject.content);
	var textToAnalyze = JSON.stringify(dataObject.content);
	// console.log("textToAnalyze: ", textToAnalyze);

	// Create request for tone analyzer
	var text = {"scorecard" : "business", "text" : textToAnalyze};

	// Prepare result text to post on blog
	var title = "Tone Analysis by Watson : " + dataObject.title;
	var toneOutput = "Original post at : <a href=\"" + dataObject.url + "\">" + dataObject.url + "</a><br><br>A break down of percentage (with actual number of words in parentheses) for each tone and tone trait<br>";

	// Do tone analysis. Anonymous callback function updates result to
	// post and adds new post to blogger
	toneAnalyzer.tone(text, function(err, results) {
	    if (err)
		console.log('Tone Analyzer error response : ', err);
	    else {
		if (resultToConsole) {
		    console.log(results);
		}
		if (addNewBlog) {
		    // Total word count to calculate percentage
		    var total = 0.0;
		    for (var i = 0; i < results.children.length; i++) {
			total = total + results.children[i].word_count;
		    }
		    for (var i = 0; i < results.children.length; i++) {
			var child = results.children[i];
			toneOutput = toneOutput + "<br>" + child.name + " : " + (100*child.word_count/total).toFixed(5) + "% (" + child.word_count + ")<br>";
			for (var j = 0; j < child.children.length; j++) {
			    var childOfChild = child.children[j];
			    toneOutput = toneOutput + "&nbsp&nbsp&nbsp&nbsp" + childOfChild.name + " : " + (100*childOfChild.word_count/total).toFixed(5) + "% (" + childOfChild.word_count + ")<br>";
			}
		    }
		    postToBlog(host, blogId, title, toneOutput, accessToken);
		}
	    }
	});
    } else {
	console.log("Error in processData : data downloaded is null");
    }
}

getContent(host, path, processData);
