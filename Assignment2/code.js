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
        palindromes: findPalindromes(txt),
        longestWords: longestWords(txt),
        mostFrequentWords: frequentWords(txt)
    };
}

function numChars(txt) {
    // handling no chars
    if (txt.match(/[\s\S]/g) === null){
        return 0;
    }
    return txt.match(/[\s\S]/g).length;
}

function numWords(txt) {
    // currently, words like let's is considered two words
    return txt.replace(/[\W]/g, " ").split(/[\s]/g).filter(Boolean).length;
}

function numLines(txt) {
    // if empty line (no spaces, tabs or chars)
    if (txt === ""){
        return 0;
    }
    return txt.split("\n").length;
}

function numNonEmptyLines(txt) {
    return txt.replace(/[ \t]/g, "").split("\n").filter(Boolean).length;
}

function avgWordLength(txt) {
    if (numWords(txt) === 0){
        return 0;
    }
    return numChars(txt.replace(/[\W\s]/g, "")) / numWords(txt);
}

function maxLineLength(txt) {
    var lines = txt.split("\n").filter(Boolean);
    var maxLine, charNum;
    for (i in lines) {
        charNum = lines[i].match(/[\s\S]/g).length;
        if (i == 0) {
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
    var wordArray = txt.toLowerCase().replace(/[\W]/g, " ").replace("'", "").split(/\s/g).filter(Boolean);
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
    var wordArray = txt.toLowerCase().replace(/[\W]/g, " ").split(/\s/g).filter(Boolean);
    wordArray.sort(function(a,b) {
        if (a.length === b.length) {
            if (a < b)
                return -1;
            if (b < a)
                return 1;
        }else {
            return b.length - a.length;
        }});
    
    var longestWords = [...new Set(wordArray)].splice(0,10);
   
    return longestWords;
}

function frequentWords(txt) {
    var wordArray = txt.toLowerCase().replace(/[\W]/g, " ").split(/\s/g).filter(Boolean);
    // if no words
    if (wordArray.length === 0){
        return [];
    }
    
     // sort/group words in alphabetical order
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
    sortedCounts = wordMap.sort(function(a, b) {
        // alphabetical sort for same word counts
        if(a.count === b.count){
            if(a.word < b.word)
                return -1;
            if(a.word > b.word)
                return 1;
        }else{
            return b.count - a.count;}
    }).splice(0, 10);
    
    for (i in sortedCounts){
        frequentWords.push(sortedCounts[i].word+'('+sortedCounts[i].count+')');
    }
    return frequentWords;
}