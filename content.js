var tooltip = null;
var targetCurrency = 'PLN';

var currencies = [ {
	regex: /(\d*[\.,]?\d*)\s*([A-Z]{3})/,
	symbol: function(match) {
	    return match[2];
	},
	amount: function(match) {
	    return match[1];
	}
    },{
	regex: /(\d*[\.,]?\d*)\s*€/,
	symbol: function(match) {
	    return 'EUR';
	},
	amount: function(match) {
	    return match[1];
	}
    },{
	regex: /£(\d*[\.,]?\d*)\s*/,
	symbol: function(match) {
	    return 'GBP';
	},
	amount: function(match) {
	    return match[1];
	}
    },{
	regex: /\$(\d*[\.,]?\d*)/,
	symbol: function(match) {
	    return 'USD';
	},
	amount: function(match) {
	    return match[1];
	}
    }
];

function sendSearch(amount, currency, onSuccess) {
    var serviceCall = 'https://api.coinbase.com/v2/prices/'+currency+'-'+targetCurrency+'/spot';

    var x = new XMLHttpRequest();
    x.open('GET', serviceCall);
    x.onload = function() {
	var d = JSON.parse(x.response);
	var exchange = d.data.amount*amount;
	var title = amount+' '+currency+' = '+ exchange+' '+targetCurrency;
        onSuccess(title);
    };
    x.send();
}


var showTooltip = function(txt, box) {
    tooltip = document.createElement("span");
    tooltip.appendChild(document.createTextNode(txt));
    document.body.appendChild(tooltip);
    var left = box.left + (box.width/2) - (tooltip.offsetWidth/2);

    var s = tooltip.style;
    s.position = 'absolute';
    s.fontFamily = 'Arial,sans-serif,Helvetica';
    s.fontSize = '15px';
    s.color = '#856404';
    s.border = '1px solid #ffeeba';
    s.background = '#fff3cd';
    s.padding = '3px';
    s.borderRadius = '5px';
    s.boxShadow = "5px 10px 15px #999";
    s.top = (box.top-tooltip.offsetHeight-3)+'px';
    s.left = left+'px';
    console.log(tooltip.style);
};

document.addEventListener('mouseup', function(e) {
    var selection = window.getSelection().toString().trim();
    if (selection != '') {
        for(const c of currencies) {
	    var match = c.regex.exec(selection);
    	    if(match) {
    	        var amount = c.amount(match).replace(',','.');
    	        var currency = c.symbol(match);
	        selectionBox = window.getSelection().getRangeAt(0).getBoundingClientRect();
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