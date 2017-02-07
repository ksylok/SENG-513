//
// this is just a stub for a function you need to implement
//
function getStats(txt) {
    return {
        nChars: numChars(txt),
        nWords: numWords(txt),
        nLines: numLines(txt),
        nNonEmptyLines: numNonEmptyLines(txt),
        averageWordLength: avgWordLength(txt),
        maxLineLength: maxLineLength(txt),
        palindromes: findPalindromes(txt), //["12321", "kayak", "mom"],
        longestWords: longestWords(txt), //["xxxxxxxxx", "123444444"],
        mostFrequentWords: frequentWords(txt) //[ "hello(7)", "world(1)" ]
    };
}

function numChars(txt) {
    return txt.match(/[\s\S]/g).length;
}

function numWords(txt) {
    // currently, words like let's is considered two words
    return txt.replace(/\W/g, " ").split(/\s/g).filter(Boolean).length;
}

function numLines(txt) {
    return txt.split("\n").length;
}

function numNonEmptyLines(txt) {
    return txt.replace(/[ \t]/g, "").split("\n").filter(Boolean).length;
}

function avgWordLength(txt) {
    return numChars(txt.replace(/[\W\s]/g, "")) / numWords(txt);
}

function maxLineLength(txt) {
    var lines = txt.split("\n").filter(Boolean);
    var maxLine, charNum;
    for (i in lines) {
        charNum = lines[i].match(/[\s\S]/g).length;
        if (i === 0) {
            maxLine = charNum;
        }
        else{
            if (charNum > maxLine){
                maxLine = charNum;
            }
        }
    }
    return maxLine;
}

function findPalindromes(txt) {
    var wordArray = txt.toLowerCase().replace(/\W/g, " ").split(/\s/g).filter(Boolean);
    var palindromes = [];
    var reverseWord;
    for (i in wordArray) {
        if(wordArray[i].length > 2){    // criteria for palindrome
            reverseWord = wordArray[i].split('').reverse().join('');
            if (reverseWord === wordArray[i]) {
                palindromes.push(wordArray[i]);
            }
        }
    }
    return palindromes;
}

function longestWords(txt) {
    var wordArray = txt.toLowerCase().replace(/\W/g, " ").split(/\s/g).filter(Boolean);
    wordArray.sort(); // alphabetical sort
    var longestWords = wordArray.sort(function(a, b) {return b.length - a.length;}).slice(0, 9);
   
    return longestWords;
}

function frequentWords(txt) {
    var wordArray = txt.toLowerCase().replace(/\W/g, " ").split(/\s/g).filter(Boolean);
    wordArray.sort();
    var wordMap = [];
    var prevKey = null;
    var count = 0;
    for (i in wordArray) {
        if (prevKey === null) {
            count = 1;
            prevKey = wordArray[i];
        }
        else if (prevKey === wordArray[i]){
            count++;
        }
        else {
            // push completed word count entry
            wordMap.push({word: prevKey, count: count});
            // reset values for new word
            count = 1;
            prevKey = wordArray[i];
        }
    }
    // push last entry from word count
    wordMap.push({word: prevKey, count: count});
    
    var sortedCounts, frequentWords = [];
    sortedCounts = wordMap.sort(function(a, b) {return b.count - a.count;}).splice(0, 9);
    for (i in sortedCounts){
        frequentWords.push(sortedCounts[i].word+'('+sortedCounts[i].count+')');
    }
    //return wordMap;
    return frequentWords;
}