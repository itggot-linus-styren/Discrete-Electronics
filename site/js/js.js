/* Global variables */
var previousPage = null;
var previousSelected = null;

var hasLoadedArticles = false;
var articles = {};

var is_mobile = false;

var doRefreshCanvas;
var gridCanvas;
var canvas;
var ctx;
var lastTime = (new Date()).getTime();

/* Webkit stuff */
var vendors = ['webkit', 'moz'];
for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
}

/* Hide all containers and open home container on website load */
$(function () {
    $("#wiki-container").children ().slice (1).hide ();
 
    hasLoadedArticles = true;
    $(".wiki-article").each (function () {
        articles[$(this).attr ("data-article_name")] = this;
    });

    var listItems = "";
    for (var a in articles) {
        listItems += "<li><a href=\"#\" onclick=\"openArticle ('#" + articles[a].id + "')\">" + a + "</li>";
    }
    $(".article-list").html (listItems);

    $(".content").hide ();
    openPage ("#home-container");
    canvas = document.querySelector (".sandbox");
    gridCanvas = document.querySelector (".grid-canvas");
    ctx = canvas.getContext ("2d");
/*
    var mql = window.matchMedia('screen and (device-width: 360px) and (device-height: 640px), screen and (device-height: 360px) and (device-width: 640px)');
    mql.addEventListener(
        function(mq) {
            is_mobile = mq.matches;
        }
    );*/

    /* Converts SVG files to inline SVG
     * see http://stackoverflow.com/a/11978996/3013334 for more information
     */
    $('img.svg').each(function(){
        var $img = jQuery(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');

        jQuery.get(imgURL, function(data) {
            // Get the SVG tag, ignore the rest
            var $svg = jQuery(data).find('svg');

            // Add replaced image's ID to the new SVG
            if(typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
            // Add replaced image's classes to the new SVG
            if(typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass+' replaced-svg');
            }

            // Remove any invalid XML tags as per http://validator.w3.org
            $svg = $svg.removeAttr('xmlns:a');

            // Replace image with new SVG
            $img.replaceWith($svg);

        }, 'xml');

    });
});

function toggleSearch (toggle) {
    console.log (toggle);
    if ($(".searchbar").hasClass ("closed") != toggle) return;

    if (toggle) $(".searchbar").removeClass ("closed");
    else $(".searchbar").addClass ("closed");
}

function select (a) {
    if (previousSelected == a) return;
    if (previousSelected != null) {
        $(previousSelected).removeClass ("selected");
    }
    $(a).addClass ("selected");
    previousSelected = a;
}

function openPage (id) {
    $('#drawer-toggle').prop('checked', false);
    if ($(previousPage) == $(id)) return;

    if (previousPage != null) {
        $(previousPage).removeClass ("selected");
        $(previousPage).hide ();
    }

    $(id).addClass ("selected");
    $(".selected").show ();
    previousPage = id;
   
    doRefreshCanvas = false;
    if (id.indexOf ("sandbox") !== -1) {
        drawAndSaveGrid ();
        doRefreshCanvas = true;
        canvasDraw ();
    }
}

function openArticle (articleId) {
    openPage ("#wiki-container");
    $("#wiki-container").children ().hide ();
    $(articleId).show ();
}

/* Search wiki for searchTerm and bring up menu including the first five results */
function onSearch (searchTerm) {
    var matchingArticles = [];
    var listItems = "";

    if (searchTerm === "") {
        $(".search-results").html ("");
        return;
    }

    if (!hasLoadedArticles) {
        hasLoadedArticles = true;
        $(".wiki-article").each (function () {
            articles[$(this).attr ("data-article_name")] = this;
        });
    }

    var c = searchTerm.toUpperCase ();
    for (var a in articles) {
        var index = a.toUpperCase ().indexOf (c);
        if (index !== -1) {
            matchingArticles.push (a);
        }
    }

    /* sort articles to show most relevant results first */
    matchingArticles.sort (function (a, b) {
        var indexA = a.toUpperCase ().indexOf (c); 
        var indexB = b.toUpperCase ().indexOf (c); 
        return  indexA < indexB ? -1 :
                indexA > indexB ? 1 : 0;
    });
    matchingArticles.forEach (function (a) {
        listItems += "<li><a href=\"#\" onclick=\"openArticle ('#" + articles[a].id + "')\">" + a + "</li>";
    });
    $(".search-results").html (listItems);
}

$('#wiki-search').on('input', function() {
    onSearch ($(this).val());
});

function canvasDraw () {
    if (!doRefreshCanvas) return;

    currentTime = (new Date()).getTime();
    delta = (currentTime - lastTime) / 1000;

    var sandbox_con = $("#sandbox-container");
    canvas.width = sandbox_con.width () - 3;
    canvas.height = sandbox_con.height () - 3;

    ctx.drawImage (gridCanvas, 0, 0);

    var tilesFromEdgeY = Math.floor (canvas.height / 120);
    var tilesFromEdgeX = Math.ceil (canvas.width / 240);
    var pos_x1 = 40 * tilesFromEdgeX + 20;
    var pos_y1 = 40 * tilesFromEdgeY + 20 - 5;
    var pos_x2 = pos_x1;
    var pos_y2 = Math.round(canvas.height / 40) * 40 - 40 * tilesFromEdgeY - 20 - 5;
    var pos_x3 = Math.round(canvas.width / 40) * 40 - 40 * tilesFromEdgeX - 20;
    var pos_y3 = Math.ceil((pos_y1 + pos_y2) / 80) * 40 - 20 - 5;

    ctx.beginPath();
    ctx.arc(pos_x1, pos_y1, 10, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.strokeStyle = 'black';
    ctx.stroke();

    ctx.font = '11px Roboto';
    ctx.fillText ("IN 1", pos_x1 - 9, pos_y1 + 22);
    
    ctx.beginPath();
    ctx.arc(pos_x2,  pos_y2, 10, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.strokeStyle = 'black';
    ctx.stroke();

    ctx.fillText ("IN 2", pos_x2 - 9, pos_y2 + 22);

    ctx.beginPath();
    ctx.arc(pos_x3,  pos_y3, 10, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.strokeStyle = 'black';
    ctx.stroke();

    ctx.fillText ("OUT", pos_x3 - 11, pos_y3 + 22);

    lastTime = currentTime;

    window.requestAnimationFrame (canvasDraw);
}

window.addEventListener('resize', drawAndSaveGrid, false);

function drawAndSaveGrid () {
    var sandbox_con = $("#sandbox-container");
    
    if (!$(sandbox_con).is(':visible')) return;

    var canvas = document.querySelector (".grid-canvas");
    var ctx = canvas.getContext ("2d");
    var bw = sandbox_con.width () - 3;
    var bh = sandbox_con.height () - 3;
    canvas.width = bw;
    canvas.height = bh;
    var p = 0;
    for (var x = 0; x <= bw; x += 40) {
        ctx.moveTo(0.5 + x + p, p);
        ctx.lineTo(0.5 + x + p, bh + p);
    }

    for (var x = 0; x <= bh; x += 40) {
        ctx.moveTo(p, 0.5 + x + p);
        ctx.lineTo(bw + p, 0.5 + x + p);
    }

    ctx.strokeStyle = "black";
    ctx.stroke();
}
