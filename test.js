a="0590a6662f9e8e6afe4a";
a = "https://api.github.com/gists/" + a;
console.log("Contacting GitHub");
var b = new XMLHttpRequest;
b.open("GET", a);
b.onreadystatechange = function() {
  if (4 == b.readyState) {
      "" === b.responseText && console.log("GitHub request returned nothing.  A connection fault, maybe?");
      var a = JSON.parse(b.responseText);
      403 === b.status ? console.log(a.message) : 200 !== b.status && 201 !== b.status ? console.log("HTTP Error " + b.status + " - " + b.statusText) : a = a.files["script.txt"].content
        }
    };
    
b.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
b.send()

console.log(b)