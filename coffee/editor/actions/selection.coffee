
#  0000000  00000000  000      00000000   0000000  000000000  000   0000000   000   000
# 000       000       000      000       000          000     000  000   000  0000  000
# 0000000   0000000   000      0000000   000          000     000  000   000  000 0 000
#      000  000       000      000       000          000     000  000   000  000  0000
# 0000000   00000000  0000000  00000000   0000000     000     000   0000000   000   000

{ post, kerror, _ } = require 'kxk'

module.exports =
    
    actions:
        menu: 'Select'
        
        selectAll:
            name:  'Select All'
            combo: 'command+a'
            accel: 'ctrl+a'
            
        selectNone:
            name:  'Deselect'
            combo: 'command+shift+a'
            accel: 'ctrl+shift+a'
            
        selectInverted:
            name:  'Invert Selection'
            text:  'selects all lines that have no cursors and no selections'
            combo: 'command+shift+i'
            accel: 'ctrl+shift+i'
            
        selectNextHighlight:
            separator: true
            name:  'Select Next Highlight'
            combo: 'command+g'
            accel: 'ctrl+g'
            
        selectPrevHighlight:
            name:  'Select Previous Highlight'
            combo: 'command+shift+g'
            accel: 'ctrl+shift+g'
                        
        selectTextBetweenCursorsOrSurround:
            name: 'Select Between Cursors, Brackets or Quotes'
            text: """
                select text between even cursors, if at least two cursors exist. 
                select text between highlighted brackets or quotes otherwise.
                """
            combo: 'command+alt+b'
            accel: 'alt+ctrl+b'

        toggleStickySelection:
            separator: true
            name:  'Toggle Sticky Selection'
            text:  'current selection is not removed when adding new selections'
            combo: 'command+`'
            accel: "ctrl+'"
            
    selectSingleRange: (r, opt) ->
        
        if not r?
            return kerror "Editor.#{name}.selectSingleRange -- undefined range!"
            
        cursorX = if opt?.before then r[1][0] else r[1][1]
        @do.start()
        @do.setCursors [[cursorX, r[0]]]
        @do.select [r]
        @do.end()
        @

    #  0000000  000000000  000   0000000  000   000  000   000  
    # 000          000     000  000       000  000    000 000   
    # 0000000      000     000  000       0000000      00000    
    #      000     000     000  000       000  000      000     
    # 0000000      000     000   0000000  000   000     000     
    
    toggleStickySelection: ->

        if @stickySelection then @endStickySelection()
        else @startStickySelection()
    
    startStickySelection: ->
        
        @stickySelection = true
        post.emit 'sticky', true
        @emit 'selection'

    endStickySelection: ->
        
        @stickySelection = false
        post.emit 'sticky', false
        @emit 'selection'

    #  0000000  000000000   0000000   00000000   000000000          00000000  000   000  0000000    
    # 000          000     000   000  000   000     000             000       0000  000  000   000  
    # 0000000      000     000000000  0000000       000     000000  0000000   000 0 000  000   000  
    #      000     000     000   000  000   000     000             000       000  0000  000   000  
    # 0000000      000     000   000  000   000     000             00000000  000   000  0000000    
    
    startSelection: (opt = extend:false) ->

        if not opt?.extend
            @startSelectionCursors = null
            if not @stickySelection
                @do.select []
            return

        if not @startSelectionCursors or @numCursors() != @startSelectionCursors.length
            @startSelectionCursors = @do.cursors()
            
            if @numSelections()
                for c in @startSelectionCursors
                    if sel = @continuousSelectionAtPosInRanges c, @do.selections()
                        if isSamePos sel[1], c
                            c[0] = sel[0][0]
                            c[1] = sel[0][1]
            
            if not @stickySelection
                @do.select rangesFromPositions @startSelectionCursors
                    
    endSelection: (opt = extend:false) ->

        if not opt?.extend 
            
            @startSelectionCursors = null
            if not @stickySelection
                @do.select []
                
        else
            
            oldCursors   = @startSelectionCursors ? @do.cursors()
            newSelection = @stickySelection and @do.selections() or []            
            newCursors   = @do.cursors()
            
            if oldCursors.length != newCursors.length
                return kerror "Editor.#{@name}.endSelection -- oldCursors.size != newCursors.size", oldCursors.length, newCursors.length
            
            for ci in [0...@do.numCursors()]
                oc = oldCursors[ci]
                nc = newCursors[ci]
                
                if not oc? or not nc?
                    return kerror "Editor.#{@name}.endSelection -- invalid cursors", oc, nc
                else
                    ranges = @rangesForLinesBetweenPositions oc, nc, true #< extend to full lines if cursor at start of line                
                    newSelection = newSelection.concat ranges
    
            @do.select newSelection
            
        @checkSalterMode()      

    #  0000000   0000000    0000000    
    # 000   000  000   000  000   000  
    # 000000000  000   000  000   000  
    # 000   000  000   000  000   000  
    # 000   000  0000000    0000000    
    
    addRangeToSelection: (range) ->
        
        @do.start()
        newSelections = @do.selections()
        newSelections.push range
        
        @do.setCursors endPositionsFromRanges(newSelections), main:'last'
        @do.select newSelections
        @do.end()

    removeSelectionAtIndex: (si) ->
        
        @do.start()
        newSelections = @do.selections()
        newSelections.splice si, 1
        if newSelections.length
            newCursors = endPositionsFromRanges newSelections
            @do.setCursors newCursors, main:(newCursors.length+si-1) % newCursors.length
        @do.select newSelections
        @do.end()        

    selectNone: -> 
        
        @do.start()
        @do.select []
        @do.end()
        
    selectAll: ->
        @do.start()
        @do.select @rangesForAllLines()
        @do.end()
        
    # 000  000   000  000   000  00000000  00000000   000000000  
    # 000  0000  000  000   000  000       000   000     000     
    # 000  000 0 000   000 000   0000000   0000000       000     
    # 000  000  0000     000     000       000   000     000     
    # 000  000   000      0      00000000  000   000     000     
    
    selectInverted: ->
        
        invertedRanges = []        
        sc = @selectedAndCursorLineIndices()
        for li in [0...@numLines()]
            if li not in sc
                invertedRanges.push @rangeForLineAtIndex li
        if invertedRanges.length
            @do.start()
            @do.setCursors [rangeStartPos _.first invertedRanges]
            @do.select invertedRanges
            @do.end()     

    # 0000000    00000000  000000000  000   000  00000000  00000000  000   000  
    # 000   000  000          000     000 0 000  000       000       0000  000  
    # 0000000    0000000      000     000000000  0000000   0000000   000 0 000  
    # 000   000  000          000     000   000  000       000       000  0000  
    # 0000000    00000000     000     00     00  00000000  00000000  000   000  
    
    selectTextBetweenCursorsOrSurround: ->

        if @numCursors() and @numCursors() % 2 == 0  
            @do.start()
            newSelections = []
            newCursors = []
            oldCursors = @do.cursors()
            for i in [0...oldCursors.length] by 2
                c0 = oldCursors[i]
                c1 = oldCursors[i+1]
                newSelections = newSelections.concat @rangesForLinesBetweenPositions c0, c1
                newCursors.push c1
            @do.setCursors newCursors
            @do.select newSelections
            @do.end()
        else @selectBetweenSurround()

    selectBetweenSurround: ->
        
        if surr = @highlightsSurroundingCursor()
            @do.start()
            start = rangeEndPos surr[0]
            end = rangeStartPos surr[1]
            s = @rangesForLinesBetweenPositions start, end
            s = cleanRanges s
            if s.length
                @do.select s
                if @do.numSelections()
                    @do.setCursors [rangeEndPos(_.last s)], Main: 'closest'
            @do.end()
            
    selectSurround: ->
        
        if surr = @highlightsSurroundingCursor()
            @do.start()
            @do.select surr
            if @do.numSelections()
                @do.setCursors (rangeEndPos(r) for r in @do.selections()), main: 'closest'
            @do.end()

    # 000   000  000   0000000   000   000  000      000   0000000   000   000  000000000   0000000  
    # 000   000  000  000        000   000  000      000  000        000   000     000     000       
    # 000000000  000  000  0000  000000000  000      000  000  0000  000000000     000     0000000   
    # 000   000  000  000   000  000   000  000      000  000   000  000   000     000          000  
    # 000   000  000   0000000   000   000  0000000  000   0000000   000   000     000     0000000   
        
    selectNextHighlight: -> # command+g
        
        if not @numHighlights() and window? # < this sucks
            searchText = window.commandline.commands.find?.currentText
            @highlightText searchText if searchText?.length
        return if not @numHighlights()
        r = rangeAfterPosInRanges @cursorPos(), @highlights()
        r ?= @highlight 0
        if r?
            @selectSingleRange r, before: r[2]?.value == 'close'
            @scrollCursorIntoView?() # < this also sucks

    selectPrevHighlight: -> # command+shift+g
        
        if not @numHighlights() and window? # < this sucks
            searchText = window.commandline.commands.find?.currentText
            @highlightText searchText if searchText?.length
        return if not @numHighlights()
        hs = @highlights()
        r = rangeBeforePosInRanges @cursorPos(), hs
        r ?= _.last hs
        @selectSingleRange r if r?
