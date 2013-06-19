water-ripple
============

Water ripples effect in javascript.

This javascript jQuery plugin to simulateWat water ripples on the surface of an image. 
There are quite a few code snipplets on the internet to simulate water ripples in javascript-canvas. However the problem with them is that they're published as bare-bone scripts with the settings hard coded inside the script. So the main task of this script is to give the developer an option to run this cool animation as the jQuery plugin.
See the demo: http://andyvr.github.io/water-ripple/demo/

## Usage Example:

**Include source files:**

```
<html>
<head>
<script src="//code.jquery.com/jquery-1.10.1.min.js"></script>
<script src="js/ripple.js"></script>
...
```


**Add an image or a div tag with the image background to the body:**

```
<img id="ripple" src="image.jpg" />
```

or

```
<div id="ripple" style="background-image:url(image.jpg);width:600px;height:300px;">
</div>
```

**Run the plugin:**

```
<script type="text/javascript">
$(document).ready(function() {
    $("#ripple").waterripple();
});
</script>
```

Also you can pass various parameters to the plugin:

```
$("#ripple").waterripple({ arbitrary: 5000 });
```

## Available parameters/options:
**arbitrary**

_type: int, default: 1000_ - time in miliseconds to generate a new random water ripple. By default it generates a new ripple every second. 0 - turns off random ripples

**onclick**

_type: boolean, default: false_ - generate a new ripple on the mouse click

**onmove**

_type: boolean, default: false_ - generate a series of ripples when moving the mouse over the animation
