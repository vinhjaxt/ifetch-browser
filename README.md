# ifetch-browser

Browser fetch api support: querystring (qs), data of form (data - urlencoded), json

# install
`npm i -S ifetch-browser`

# browser install
```html
<script src="ifetch.min.js"></script>
```

# Example
```js
// firstly run: npm i -S ifetch-browser

import ifetch from 'ifetch-browser'

// basic usage

ifetch('http://echo.opera.com/').then(r => r.text()).then(console.log).catch(console.error)

// with options
ifetch('http://echo.opera.com/', {
  method: 'POST',
  headers: {
    'X-Token': 'Access token here'
  }
})

// POST form urlencoded data
ifetch('http//echo.opera.com/', {
  method: 'POST',
  data: {
    a: 1,
    b: 2,
    submit: 'OK'
  }
})

// POST json data
ifetch('http://echo.opera.com/', {
  method: "POST",
  json: {
    abc: 123
  }
})

// POST raw data
ifetch('http://echo.opera.com/', {
  method: 'POST',
  body: 'chak'
})

// POST form-data
// npm i -S form-data
const formData = new FormData()
formData.append('file', input.files[0], 'filename.ext')
ifetch('http://echo.opera.com/', {
  method: 'POST',
  body: formData
})

// use json to receive and parse json
ifetch('http://echo.opera.com/', {
  json: true
})

// send json but dont parse the response
ifetch('http://echo.opera.com/', {
  noParseJSON: true,
  method: 'POST',
  json: {
    data: 1
  }
})

// querystring support
ifetch('http://echo.opera.com/', {
  qs: {
    this: 'is',
    in: 'url'
  }
})

// you can also use querystring in post request
ifetch('http://echo.opera.com/', {
  qs: {
    parent_id: 1
  },
  json: {
    id: 2
  },
  method: 'POST'
})


// Default options
const myFecth = ifetch.defaults({
  url: 'http://echo.opera.com', // baseURL,
  headers: { // default options
    'User-Agent': 'ifetch/1.0.3'
  },
  options: function () {
    // dynamic options function
    return {
      // return options object
      json: true,
      headers: {
        'X-Token': getAccessToken()
      }
    }
  }
})

myFecth('/?abc' /* => http://echo.opera.com/?abc */)

```

# Default options
```js
const DEFAULT_OPTIONS = {
  method: 'get',
  headers: {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    Pragma: 'no-cache',
    'Cache-Control': 'no-cache',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
  },
  body: null,
  cache: 'no-cache',
  redirect: 'follow', // set to `manual` to extract redirect headers, `error` to reject redirect
}
```

# Thank you
