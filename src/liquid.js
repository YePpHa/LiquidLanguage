function isValidTokenCharacter(ch) {
  return regex_token_character.test(ch);
}

function extendArray(arr1, arr2) {
  Array.prototype.push.apply(arr1, arr2);
}

function flush(formatted_string, inside_cache, method, method_arguments, method_cache) {
  extendArray(formatted_string, inside_cache);
  emptyArray(inside_cache);
  emptyArray(method);
  emptyArray(method_arguments);
  emptyArray(method_cache);
}

function emptyArray(arr) {
  while(arr.length > 0) {
    arr.pop();
  }
}

function trimArray(arr) {
  for (var i = 0, len = arr.length; i < len; i++) {
    arr[i] = arr[i].trim();
  }
}

function Liquid() {
  this.functions = {};
}

Liquid.prototype.format = function format(str) {
  var chars = str.split("");
  var formatted_string = [];
  
  var brackets = 0;
  var inside_cache = [];
  
  var method = [];
  var method_arguments = [];
  var method_cache = [];
  
  for (var i = 0, len = chars.length; i < len; i++) {
    inside_cache.push(chars[i]);
    if (brackets < 2 && method_cache.length === 0) {
      if (chars[i] === '{') {
        brackets++;
      } else {
        flush(formatted_string, inside_cache, method, method_arguments, method_cache);
        brackets = 0;
      }
    } else if (brackets === 2 || method_cache.length > 0) {
      if (isValidTokenCharacter(chars[i])) {
        if (chars[i] === '|') {
          if (method.length === 0) {
            method = method_cache;
          } else {
            method_arguments.push(method_cache.join(""));
          }
          method_cache = [];
        } else if (chars[i] === '}') {
          brackets--;
          if (brackets === 0 && method_cache.length > 0) {
            if (method.length === 0) {
              method = method_cache;
            } else {
              method_arguments.push(method_cache.join(""));
            }
            method_cache = [];
          }
          if (brackets === 0 && method.length > 0) {
            trimArray(method_arguments);
            method = method.join("").trim();
            if (method in this.functions) {
              formatted_string.push(this.functions[method].apply(this, method_arguments));
              
              emptyArray(inside_cache);
            }
            method = [];
            emptyArray(method_arguments);
            emptyArray(method_cache);
          }
        } else {
          method_cache.push(chars[i]);
        }
      } else {
        // Syntax broken
        flush(formatted_string, inside_cache, method, method_arguments, method_cache);
        brackets = 0;
      }
    } else {
      flush(formatted_string, inside_cache, method, method_arguments, method_cache);
      brackets = 0;
    }
  }
  flush(formatted_string, inside_cache, method, method_arguments, method_cache);
  
  return formatted_string.join("");
}

var regex_token_character = /^[\w\s\-.*+?^${}()|[\]\\]+$/;

exports["Liquid"] = Liquid;

/** Example
var liq = new Liquid();

liq.functions.require = function(){
  console.log.apply(console, ["require"].concat(arguments));
  return "cheese flavor";
};

liq.functions.wrap = function(str, prefix, suffix){
  return prefix + str + suffix;
};

liq.format("I really love my ice cream with {{ require | args1 | args 2|args3 }}!!");
liq.format("I really love my ice cream with {{ wrap | flavor | white | with cheese }}!!");

**/