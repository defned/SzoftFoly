﻿$(function() {
    $( ".tag_collection *" ).draggable({
        containment: "body",
        revert: true
    });
    
    $( "#tag_and" ).droppable({
        accept: ".tag_collection *",
        drop: function(event, ui){ addToCtc("AND",ui.draggable[0].innerText); },
        tolerance: "pointer"
    });    
    
    $( "#tag_or" ).droppable({
        accept: ".tag_collection *",
        drop: function(event, ui){ addToCtc("OR",ui.draggable[0].innerText); },
        tolerance: "pointer"
    });
    
    files = [ 
        { name: "Track1.mp3", link: "Track1.mp3", size: 4*1024*1024, tags: [ "Zene", "Rock" ] },
        { name: "Track2.mp3", link: "Track2.mp3", size: 6*1024*1024,  tags: [ "Zene" ] },
        { name: "Rock.jpg", link: "Rock.jpg", size: 6*1024*1024, tags: [ "Képek", "Rock" ] }
    ];
    
    topTags = [];
    
    function addToCtc(type,tag) {
        if (currTagCombination.elems.length == 0) {
            // ALL OR sth = ALL, NONE AND sth = NONE
            if (type != currTagCombination.type) return; 
            // ALL AND sth = sth, NONE OR sth = sth
            else currTagCombination = { type: type, elems: [tag] };
        } else if (currTagCombination.type == type) {
            // sth AND sth = sth, sth OR sth = sth
            if ($.inArray(tag, currTagCombination.elems) >= 0) return;
            currTagCombination.elems.push(tag);
        } else {
            currTagCombination = {type:type, elems:[currTagCombination, tag]};
        }
        refrehFiles();
        refreshCTC();
    }
    
    function refrehFiles() {
        var matchingFiles = [];
        $.each(files, function(i,file){
            if(evalTagMatching(currTagCombination,file)) {
                matchingFiles.push(file);
            }
        });
        $( "#file_list tbody" ).empty();
        $.each(matchingFiles, function() {
            $( "#file_list tbody" ).append( 
               "<tr><td>" + this.name + "</td>" 
               + "<td>" + sizeToText(this.size) + "</td></tr>" );
        });
    }
    
    function sizeToText(size) {
        if(size <= 1024) return size + " B";
        if(size <= 1024*1024) return size/1024 + " KB";
        if(size <= 1024*1024*1024) return size/1024/1024 + " MB";
        return size/1024/1024/1024 + " GB" ;
    }
    
    function refreshCTC() {
        $("#navlist .elem").remove();
        $("#navlist .filtering").after(getCTCHeader(currTagCombination));
    }
    
    function getCTCHeader(ctc) {
        if($.type(ctc) == "string") return "<li class='elem'><a href='#'>" + ctc + "</a></li>";
        else {
            if(ctc.elems.length == 0)
                if(ctc.type == "AND") return "ALL";
                else return "NONE";
            else return ctc.elems.map(getCTCHeader).join(" <li class='elem'>"+ctc.type+"</li> ");
        }
    }
    
    // tag selection representation:
    // TS ::= { type: "OR", elems: [TS*] } | { type: "AND", elems: [TS*] } | '"'tagname'"'
    currTagCombination = { type: "AND", elems: [] };
    
    function evalTagMatching(ctc,file) {
        if($.type(ctc) == "string") {
            for( var i = 0; i < file.tags.length; i++ ) {
                if (ctc == file.tags[i])
                    return true;
            }
            return false;
        } else { 
            if(ctc.type == "OR") {
                for( var i = 0; i < ctc.elems.length; i++ ) {
                    if (evalTagMatching(ctc.elems[i], file)) 
                        return true;
                }
                return false;
            }
            if(ctc.type == "AND") {
                for( var i = 0; i < ctc.elems.length; i++ ) {
                    if (!evalTagMatching(ctc.elems[i], file)) 
                        return false;
                }
                return true;
            }
        }
    }
    
    refrehFiles();
    
});
