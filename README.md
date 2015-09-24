# BlogTone
This is a sample Node.js project to test out Watson Tone Analyzer API. It also uses the Google Blogger v3 API.

Pulls a public blog post from blogger. Runs Watson Tone Analyzer on it. Posts word count of tones and tone traits and calculated percentages as a new blog post

APIs used
* Watson Tone Analyzer v1
* Google Blogger v3

What to edit before running this app
* Edit the following in config.js
    api_key - API key for google Blogger v3 API. Obtain this from blogger at https://console.developers.google.com/
    blog_id_read_from - blog id for blog from which to read post to be analyzed
    post_id - post id of post to be analyzed
    blog_id_write_to - blog id for blog to which tone analysis result is to be published
    access_token - access token to publish to blog with id blog_id_write_to (obtained with OAuth2). Obtain this from blogger at         https://developers.google.com/oauthplayground/
* Edit the following in app.js
    addNewBlog - false by default, set to true to publish analysis results to a blog post
    resultToConsole = true by default, set to false to suppress the full result of tone analysis being displayed on console
    Watson Tone Analyzer credentials - change username, password to those for your own instance of the service

How to run this app
* Run 'npm install'
* Run 'node app.js'

