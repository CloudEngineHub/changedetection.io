// Restock Detector
// (c) Leigh Morresi dgtlmoon@gmail.com
//
// Assumes the product is in stock to begin with, unless the following appears above the fold ;
// - outOfStockTexts appears above the fold (out of stock)
// - negateOutOfStockRegex (really is in stock)

function isItemInStock() {
    // @todo Pass these in so the same list can be used in non-JS fetchers
    const outOfStockTexts = [
        ' أخبرني عندما يتوفر',
        '0 in stock',
        'actuellement indisponible',        
        'agotado',
        'article épuisé',
        'artikel zurzeit vergriffen',
        'as soon as stock is available',
        'ausverkauft', // sold out
        'available for back order',
        'back-order or out of stock',
        'back in stock soon',
        'backordered',
        'benachrichtigt mich', // notify me
        'brak na stanie',
        'brak w magazynie',
        'coming soon',
        'currently have any tickets for this',
        'currently unavailable',
        'dieser artikel ist bald wieder verfügbar',
        'dostępne wkrótce',
        'en rupture de stock',
        'ist derzeit nicht auf lager',
        'item is no longer available',
        'let me know when it\'s available',
        'message if back in stock',
        'nachricht bei',
        'nicht auf lager',
        'nicht lieferbar',
        'nicht zur verfügung',
        'niet beschikbaar',
        'niet leverbaar',
        'niet op voorraad',
        'no disponible temporalmente',
        'no longer in stock',
        'no tickets available',
        'not available',
        'not currently available',
        'not in stock',
        'notify me when available',
        'notify when available',
        'não estamos a aceitar encomendas',
        'out of stock',
        'out-of-stock',
        'prodotto esaurito',
        'produkt niedostępny',
        'sold out',
        'sold-out',
        'temporarily out of stock',
        'temporarily unavailable',
        'tickets unavailable',
        'tijdelijk uitverkocht',
        'unavailable tickets',
        'vorbestellung ist bald möglich',
        'we do not currently have an estimate of when this product will be back in stock.',
        'we don\'t know when or if this item will be back in stock.',
        'zur zeit nicht an lager',
        '品切れ',
        '已售完',
        '已售',
        '품절'
    ];


    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

    function getElementBaseText(element) {
        // .textContent can include text from children which may give the wrong results
        // scan only immediate TEXT_NODEs, which will be a child of the element
        var text = "";
        for (var i = 0; i < element.childNodes.length; ++i)
            if (element.childNodes[i].nodeType === Node.TEXT_NODE)
                text += element.childNodes[i].textContent;
        return text.toLowerCase().trim();
    }

    const negateOutOfStockRegex = new RegExp('^([0-9] in stock|add to cart|in stock)', 'ig');

    // The out-of-stock or in-stock-text is generally always above-the-fold
    // and often below-the-fold is a list of related products that may or may not contain trigger text
    // so it's good to filter to just the 'above the fold' elements
    // and it should be atleast 100px from the top to ignore items in the toolbar, sometimes menu items like "Coming soon" exist


// @todo - if it's SVG or IMG, go into image diff mode
// %ELEMENTS% replaced at injection time because different interfaces use it with different settings

    console.log("Scanning %ELEMENTS%");

    function collectVisibleElements(parent, visibleElements) {
        if (!parent) return; // Base case: if parent is null or undefined, return

        // Add the parent itself to the visible elements array if it's of the specified types
        visibleElements.push(parent);

        // Iterate over the parent's children
        const children = parent.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (
                child.nodeType === Node.ELEMENT_NODE &&
                window.getComputedStyle(child).display !== 'none' &&
                window.getComputedStyle(child).visibility !== 'hidden' &&
                child.offsetWidth >= 0 &&
                child.offsetHeight >= 0 &&
                window.getComputedStyle(child).contentVisibility !== 'hidden'
            ) {
                // If the child is an element and is visible, recursively collect visible elements
                collectVisibleElements(child, visibleElements);
            }
        }
    }

    const elementsToScan = [];
    collectVisibleElements(document.body, elementsToScan);

    var elementText = "";

    // REGEXS THAT REALLY MEAN IT'S IN STOCK
    for (let i = elementsToScan.length - 1; i >= 0; i--) {
        const element = elementsToScan[i];

        // outside the 'fold' or some weird text in the heading area
        // .getBoundingClientRect() was causing a crash in chrome 119, can only be run on contentVisibility != hidden
        if (element.getBoundingClientRect().top + window.scrollY >= vh || element.getBoundingClientRect().top + window.scrollY <= 100) {
            continue
        }

        elementText = "";
        if (element.tagName.toLowerCase() === "input") {
            elementText = element.value.toLowerCase().trim();
        } else {
            elementText = getElementBaseText(element);
        }

        if (elementText.length) {
            // try which ones could mean its in stock
            if (negateOutOfStockRegex.test(elementText)) {
                console.log(`Negating/overriding 'Out of Stock' back to "Possibly in stock" found "${elementText}"`)
                return 'Possibly in stock';
            }
        }
    }

    // OTHER STUFF THAT COULD BE THAT IT'S OUT OF STOCK
    for (let i = elementsToScan.length - 1; i >= 0; i--) {
        const element = elementsToScan[i];
        // outside the 'fold' or some weird text in the heading area
        // .getBoundingClientRect() was causing a crash in chrome 119, can only be run on contentVisibility != hidden
        if (element.getBoundingClientRect().top + window.scrollY >= vh || element.getBoundingClientRect().top + window.scrollY <= 100) {
            continue
        }
        elementText = "";
        if (element.tagName.toLowerCase() === "input") {
            elementText = element.value.toLowerCase().trim();
        } else {
            elementText = getElementBaseText(element);
        }

        if (elementText.length) {
            // and these mean its out of stock
            for (const outOfStockText of outOfStockTexts) {
                if (elementText.includes(outOfStockText)) {
                    console.log(`Selected 'Out of Stock' - found text "${outOfStockText}" - "${elementText}"`)
                    return outOfStockText; // item is out of stock
                }
            }
        }
    }

    console.log(`Returning 'Possibly in stock' - cant' find any useful matching text`)
    return 'Possibly in stock'; // possibly in stock, cant decide otherwise.
}

// returns the element text that makes it think it's out of stock
return isItemInStock().trim()


