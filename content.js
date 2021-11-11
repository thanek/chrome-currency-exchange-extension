const targetCurrency = 'PLN';
const debug = false;

var tooltip = null;

var symbols = [
    {symbol: '\\$', currency: 'USD'},
    {symbol: '€', currency: 'EUR'},
    {symbol: '£', currency: 'GBP'},
    {symbol: '฿', currency: 'BTC'}
];
var roundingExclude = [ 'BTC' ];

var createCurrenciesTable = function() {
    var c = [{
	regex: /^(\d*[\.,]?\d*)\s*([A-Z]{3})$/,
	currency: function(match) {
	    return match[2];
	},
	amount: function(match) {
	    return match[1];
	}
    }];
    
    for(s of symbols) {
	var currencyCode = s.currency;
	c.push({
	    regex: new RegExp('^(\\d*[\\.,]?\\d*)\\s*'+s.symbol+'$'),
	    currency: currencyCode,
	    amount: function(match) {
		return match[1];
	    }
	});
	c.push({
	    regex: new RegExp('^'+s.symbol+'(\\d*[\\.,]?\\d*)$'),
	    currency: currencyCode,
	    amount: function(match) {
		return match[1];
	    }
	});
    }
    return c;
}
var currencies = createCurrenciesTable();
if(debug) {
    console.log('currencies table', currencies);
}

function sendSearch(amount, currency, onSuccess) {
    if(debug) {
	console.log('Getting exchange for ', amount, currency);
    }
    var serviceCall = 'https://api.coinbase.com/v2/prices/'+currency+'-'+targetCurrency+'/spot';

    var x = new XMLHttpRequest();
    x.open('GET', serviceCall);
    x.onload = function() {
	var d = JSON.parse(x.response);
	var exchange = d.data.amount*amount;
	if(!roundingExclude.includes(targetCurrency)) {
	    exchange = Math.round(exchange*100)/100;
	}
	var title = amount+' '+currency+' = '+ exchange+' '+targetCurrency;
        onSuccess(title);
    };
    x.send();
}


var showTooltip = function(txt, box) {
    tooltip = document.createElement("div");
    tooltip.appendChild(document.createTextNode(txt));
    document.body.appendChild(tooltip);

    var s = tooltip.style;
    s.zIndex = '999';
    s.display = 'block';
    s.position = 'absolute';
    s.fontFamily = 'Arial,sans-serif,Helvetica';
    s.fontSize = '12px';
    s.color = '#1b1e21';
    s.border = '1px solid #c6c8ca';
    s.background = '#d6d8d9';
    s.padding = '3px';
    s.borderRadius = '3px';
    s.boxShadow = "5px 5px 10px #666";
    s.margin = '0';
    
    var relative = document.body.parentNode.getBoundingClientRect();

    style = getComputedStyle(tooltip);
    var w = parseInt(style.width);
    var h = parseInt(style.height);
    
    var left = (box.left-relative.left) + (box.width/2) - (w/2);
    s.left = left+'px';
    s.top = (box.top-relative.top-h-3)+'px';
};

document.addEventListener('mouseup', function(e) {
    var selection = window.getSelection().toString().trim();
    if (selection != '') {
        for(const c of currencies) {
	    var match = c.regex.exec(selection);
	    if(debug) {
		console.log('checking match against '+selection+' for', c, match);
	    }
    	    if(match) {
    	        var amount = c.amount(match).replace(',','.');
    	        var currency = (typeof c.currency === 'function') ? c.currency(match) : c.currency;
	        var selectionBox = window.getSelection().getRangeAt(0).getBoundingClientRect();
    	        sendSearch(amount, currency, function(txt) {
    	    	    showTooltip(txt, selectionBox);
    		});
    		break;
    	    }
    	}
    }
});

document.addEventListener('selectionchange', function() {
    var selection = window.getSelection().toString().trim();
    if(selection == '' && tooltip != null) {
	tooltip.parentElement.removeChild(tooltip);
	tooltip = null;
    }
});