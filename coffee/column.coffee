###
 0000000   0000000   000      000   000  00     00  000   000
000       000   000  000      000   000  000   000  0000  000
000       000   000  000      000   000  000000000  000 0 000
000       000   000  000      000   000  000 0 000  000  0000
 0000000   0000000   0000000   0000000   000   000  000   000
###

{ post, prefs, stopEvent, setStyle, keyinfo, popup, slash, valid, clamp, empty, state, open, elem, kpos, fs, klog, kerror, $, _ } = require 'kxk'

Row      = require './row'
Scroller = require './tools/scroller'
File     = require './tools/file'
fuzzy    = require 'fuzzy'
wxw      = require 'wxw'

class Column
    
    constructor: (@browser) ->
        
        @searchTimer = null
        @search = ''
        @items  = []
        @rows   = []
        
        @div   = elem class: 'browserColumn' tabIndex:6
        @table = elem class: 'browserColumnTable'
        @div.appendChild @table
        
        @crumb = elem class:'crumb'
        @crumb.columnIndex = @index
        @crumb.addEventListener 'dblclick' @makeRoot
        
        @setIndex @browser.columns?.length
                
        $('crumbs').appendChild @crumb
        
        @browser.cols?.appendChild @div
        
        @div.addEventListener 'focus'     @onFocus
        @div.addEventListener 'blur'      @onBlur
        @div.addEventListener 'keydown'   @onKey
        
        @div.addEventListener 'mouseover' @onMouseOver
        @div.addEventListener 'mouseout'  @onMouseOut

        # @div.addEventListener 'mouseup'   @onClick
        @div.addEventListener 'click'     @onClick
        @div.addEventListener 'dblclick'  @onDblClick
        
        @div.addEventListener 'contextmenu' @onContextMenu
        
        @scroll = new Scroller @
        
    setIndex: (@index) ->
        
        @crumb.columnIndex = @index
        
    dropRow: (row, pos) -> 
    
        # klog 'drop' row.item, @rowAtPos(pos)?.item, @parent.file
        
        if targetRow = @rowAtPos pos
            item = targetRow.item
            if item.type == 'dir'
                row.rename slash.join item.file, row.item.name
            else
                row.rename slash.join slash.dir(item.file), row.item.name
        else
            row.rename slash.join @parent.file, row.item.name
        
    #  0000000  00000000  000000000  000  000000000  00000000  00     00   0000000  
    # 000       000          000     000     000     000       000   000  000       
    # 0000000   0000000      000     000     000     0000000   000000000  0000000   
    #      000  000          000     000     000     000       000 0 000       000  
    # 0000000   00000000     000     000     000     00000000  000   000  0000000   
    
    loadItems: (items, parent) ->
        
        @browser.clearColumn @index
        
        @items  = items
        @parent = parent
        
        if @index == 0
            @crumb.innerHTML = File.crumbSpan slash.tilde @parent.file
        else
            @crumb.innerHTML = slash.base @parent.file
        
        if @parent.type == undefined
            log 'column.loadItems' String @parent
            @parent.type = slash.isDir(@parent.file) and 'dir' or 'file'
        
        kerror "no parent item?" if not @parent?
        kerror "loadItems -- no parent type?", @parent if not @parent.type?
        
        if valid @items
            for item in @items
                @rows.push new Row @, item
        
            @scroll.update()
        @
        
    unshiftItem: (item) ->
        
        @items.unshift item
        @rows.unshift new Row @, item
        @table.insertBefore @table.lastChild, @table.firstChild
        @scroll.update()
        @rows[0]
        
    pushItem: (item) ->
        
        @items.push item
        @rows.push new Row @, item
        @scroll.update()
        @rows[-1]
        
    addItem: (item) ->
        
        row = @pushItem item
        @sortByName()
        row

    setItems: (@items, opt) ->
        
        @browser.clearColumn @index
        
        @parent = opt.parent
        kerror "no parent item?" if not @parent?
        kerror "setItems -- no parent type?", @parent if not @parent.type?
        
        for item in @items
            @rows.push new Row @, item
        
        @scroll.update()
        @

    isDir:  -> @parent?.type == 'dir' 
    isFile: -> @parent?.type == 'file' 
        
    isEmpty: -> empty @parent
    clear:   ->
        @clearSearch()
        delete @parent
        @div.scrollTop = 0
        @editor?.del()
        @table.innerHTML = ''
        @crumb.innerHTML = ''
        @rows = []
        @scroll.update()
                    
    #  0000000    0000000  000000000  000  000   000  00000000  
    # 000   000  000          000     000  000   000  000       
    # 000000000  000          000     000   000 000   0000000   
    # 000   000  000          000     000     000     000       
    # 000   000   0000000     000     000      0      00000000  
   
    activateRow:  (row) -> @row(row)?.activate()
       
    activeRow: -> _.find @rows, (r) -> r.isActive()
    activePath: -> @activeRow()?.path()
    
    row: (row) -> # accepts element, index, string or row
        if      _.isNumber  row then return 0 <= row < @numRows() and @rows[row] or null
        else if _.isElement row then return _.find @rows, (r) -> r.div.contains row
        else if _.isString  row then return _.find @rows, (r) -> r.item.name == row
        else return row
            
    nextColumn: -> @browser.column @index+1
    prevColumn: -> @browser.column @index-1
        
    name: -> "#{@browser.name}:#{@index}"
    path: -> @parent?.file ? ''
        
    numRows:    -> @rows.length ? 0   
    rowHeight:  -> @rows[0]?.div.clientHeight ? 0
    numVisible: -> @rowHeight() and parseInt(@browser.height() / @rowHeight()) or 0
    
    rowAtPos: (pos) -> @row @rowIndexAtPos pos
    
    rowIndexAtPos: (pos) ->
        
        Math.max 0, Math.floor (pos.y - @div.getBoundingClientRect().top) / @rowHeight()
    
    # 00000000   0000000    0000000  000   000   0000000  
    # 000       000   000  000       000   000  000       
    # 000000    000   000  000       000   000  0000000   
    # 000       000   000  000       000   000       000  
    # 000        0000000    0000000   0000000   0000000   
    
    hasFocus: -> @div.classList.contains 'focus'

    focus: (opt={}) ->
        if not @activeRow() and @numRows() and opt?.activate != false
            @rows[0].setActive()
        @div.focus()
        @
        
    onFocus: => @div.classList.add 'focus'
    onBlur:  => @div.classList.remove 'focus'

    focusBrowser: -> @browser.focus()
    
    # 00     00   0000000   000   000   0000000  00000000  
    # 000   000  000   000  000   000  000       000       
    # 000000000  000   000  000   000  0000000   0000000   
    # 000 0 000  000   000  000   000       000  000       
    # 000   000   0000000    0000000   0000000   00000000  
    
    onMouseOver: (event) => @row(event.target)?.onMouseOver()
    onMouseOut:  (event) => @row(event.target)?.onMouseOut()
    onClick:     (event) => @row(event.target)?.activate event
    onDblClick:  (event) => 
        @browser.skipOnDblClick = true
        @navigateCols 'enter'

    #  0000000  00000000   000   000  00     00  0000000    
    # 000       000   000  000   000  000   000  000   000  
    # 000       0000000    000   000  000000000  0000000    
    # 000       000   000  000   000  000 0 000  000   000  
    #  0000000  000   000   0000000   000   000  0000000    
    
    updateCrumb: =>
        
        br = @div.getBoundingClientRect()
        @crumb.style.left = "#{br.left}px"
        if @index == @browser.numCols()-1
            width = br.right - br.left - 135
            @crumb.style.width = "#{width}px"
            if width < 50
                @crumb.style.display = 'none'
            else
                @crumb.style.display = null
        else
            @crumb.style.width = "#{br.right - br.left}px"
    
    # 000   000   0000000   000   000  000   0000000    0000000   000000000  00000000  
    # 0000  000  000   000  000   000  000  000        000   000     000     000       
    # 000 0 000  000000000   000 000   000  000  0000  000000000     000     0000000   
    # 000  0000  000   000     000     000  000   000  000   000     000     000       
    # 000   000  000   000      0      000   0000000   000   000     000     00000000  

    navigateRows: (key) ->

        return error "no rows in column #{@index}?" if not @numRows()
        index = @activeRow()?.index() ? -1
        error "no index from activeRow? #{index}?", @activeRow() if not index? or Number.isNaN index
        
        index = switch key
            when 'up'        then index-1
            when 'down'      then index+1
            when 'home'      then 0
            when 'end'       then @numRows()-1
            when 'page up'   then index-@numVisible()
            when 'page down' then index+@numVisible()
            else index
            
        error "no index #{index}? #{@numVisible()}" if not index? or Number.isNaN index        
        index = clamp 0, @numRows()-1, index
        
        error "no row at index #{index}/#{@numRows()-1}?", @numRows() if not @rows[index]?.activate?
        if not @rows[index].isActive()
            @rows[index].activate()
    
    navigateCols: (key) -> # move to file browser?
        
        switch key
            when 'up'    then @browser.navigate 'up'
            when 'left'  then @browser.navigate 'left'
            when 'right' then @browser.navigate 'right'
            when 'enter'
                if item = @activeRow()?.item
                    type = item.type
                    # klog 'navigateCols' item
                    if type == 'dir'
                        # post.emit 'filebrowser' 'loadItem' item, focus:true
                        @browser.loadItem item
                    else if item.file
                        post.emit 'openFile' item.file
        @

    navigateRoot: (key) -> 
        
        @browser.browse switch key
            when 'left'  then slash.dir @parent.file
            when 'right' then @activeRow().item.file
        @
            
    #  0000000  00000000   0000000   00000000    0000000  000   000    
    # 000       000       000   000  000   000  000       000   000    
    # 0000000   0000000   000000000  0000000    000       000000000    
    #      000  000       000   000  000   000  000       000   000    
    # 0000000   00000000  000   000  000   000   0000000  000   000    
    
    doSearch: (char) ->
        
        return if not @numRows()
        
        clearTimeout @searchTimer
        @searchTimer = setTimeout @clearSearch, 2000
        @search += char
        
        if not @searchDiv
            @searchDiv = elem class: 'browserSearch'
            
        @searchDiv.textContent = @search

        activeIndex  = @activeRow()?.index() ? 0
        activeIndex += 1 if (@search.length == 1) or (char == '')
        activeIndex  = 0 if activeIndex >= @numRows()
        
        for rows in [@rows.slice(activeIndex), @rows.slice(0,activeIndex+1)]
            fuzzied = fuzzy.filter @search, rows, extract: (r) -> r.item.name
            
            if fuzzied.length
                row = fuzzied[0].original
                row.div.appendChild @searchDiv
                row.activate()
                break
        @
    
    clearSearch: =>
        
        @search = ''
        @searchDiv?.remove()
        delete @searchDiv
        @
    
    removeObject: =>
        
        if row = @activeRow()
            nextOrPrev = row.next() ? row.prev()
            @removeRow row
            nextOrPrev?.activate()
        @

    removeRow: (row) ->
        
        row.div.remove()
        @items.splice row.index(), 1
        @rows.splice row.index(), 1
        
    #  0000000   0000000   00000000   000000000  
    # 000       000   000  000   000     000     
    # 0000000   000   000  0000000       000     
    #      000  000   000  000   000     000     
    # 0000000    0000000   000   000     000     
    
    sortByName: ->
         
        @rows.sort (a,b) -> 
            (a.item.type + a.item.name).localeCompare(b.item.type + b.item.name)
            
        @table.innerHTML = ''
        for row in @rows
            @table.appendChild row.div
        @
        
    sortByType: ->
        
        @rows.sort (a,b) -> 
            atype = a.item.type == 'file' and slash.ext(a.item.name) or '___' #a.item.type
            btype = b.item.type == 'file' and slash.ext(b.item.name) or '___' #b.item.type
            (a.item.type + atype + a.item.name).localeCompare(b.item.type + btype + b.item.name, undefined, numeric:true)
            
        @table.innerHTML = ''
        for row in @rows
            @table.appendChild row.div
        @
  
    # 000000000   0000000    0000000    0000000   000      00000000  
    #    000     000   000  000        000        000      000       
    #    000     000   000  000  0000  000  0000  000      0000000   
    #    000     000   000  000   000  000   000  000      000       
    #    000      0000000    0000000    0000000   0000000  00000000  
    
    toggleDotFiles: =>

        if @parent.type == undefined
            log 'column.toggleDotFiles' @parent
            @parent.type = slash.isDir(@parent.file) and 'dir' or 'file'
            
        if @parent.type == 'dir'            
            stateKey = "browser▸showHidden▸#{@parent.file}"
            if prefs.get stateKey
                prefs.del stateKey
            else
                prefs.set stateKey, true
            @browser.loadDirItem @parent, @index, ignoreCache:true
        @
                
    # 000000000  00000000    0000000    0000000  000   000  
    #    000     000   000  000   000  000       000   000  
    #    000     0000000    000000000  0000000   000000000  
    #    000     000   000  000   000       000  000   000  
    #    000     000   000  000   000  0000000   000   000  
    
    moveToTrash: =>
        
        pathToTrash = @activePath()
        @removeObject()
        
        wxw 'trash' pathToTrash
        # trash([pathToTrash]).catch (err) -> error "failed to trash #{pathToTrash} #{err}"

    addToShelf: =>
        
        if pathToShelf = @activePath()
            post.emit 'addToShelf' pathToShelf
        
    duplicateFile: =>
        
        unusedFilename = require 'unused-filename'
        unusedFilename(@activePath()).then (fileName) =>
            fileName = slash.path fileName
            if fs.copy? # fs.copyFile in node > 8.4
                fs.copy @activePath(), fileName, (err) =>
                    return error 'copy file failed' err if err?
                    item = type:'file' file:slash.join slash.dir(@activePath()), fileName
                    post.emit 'filebrowser' 'loadItem' item, focus:true
                    # post.emit 'loadFile' fileName
                    
    # 00000000  000   000  00000000   000       0000000   00000000   00000000  00000000   
    # 000        000 000   000   000  000      000   000  000   000  000       000   000  
    # 0000000     00000    00000000   000      000   000  0000000    0000000   0000000    
    # 000        000 000   000        000      000   000  000   000  000       000   000  
    # 00000000  000   000  000        0000000   0000000   000   000  00000000  000   000  
    
    explorer: =>
        
        open slash.dir @activePath()
        
    open: =>
        
        open @activePath()
                  
    # 00000000    0000000   00000000   000   000  00000000     
    # 000   000  000   000  000   000  000   000  000   000    
    # 00000000   000   000  00000000   000   000  00000000     
    # 000        000   000  000        000   000  000          
    # 000         0000000   000         0000000   000          
        
    makeRoot: => 
        
        @browser.shiftColumnsTo @index
        
        if @browser.columns[0].items[0].name != '..'
            @unshiftItem 
                name: '..'
                type: 'dir'
                file: slash.dir @parent.file
    
    onContextMenu: (event, column) => 
        
        stopEvent event
        
        absPos = kpos event
        
        if not column
            @showContextMenu absPos
        else
            
            opt = items: [ 
                text:   'Root'
                cb:     @makeRoot
            ,
                text:   'Add to Shelf'
                combo:  'alt+shift+.'
                cb:     => post.emit 'addToShelf' @parent.file
            ,
                text:   'Explorer'
                combo:  'alt+e' 
                cb:     => open @parent.file
            ]
            
            opt.x = absPos.x
            opt.y = absPos.y
            popup.menu opt    
              
    showContextMenu: (absPos) =>
        
        if not absPos?
            absPos = kpos @div.getBoundingClientRect().left, @div.getBoundingClientRect().top
        
        opt = items: [ 
            text:   'Toggle Invisible'
            combo:  'ctrl+i' 
            cb:     @toggleDotFiles
        ,
            text:   'Refresh'
            combo:  'ctrl+r' 
            cb:     @browser.refresh
        ,
            text:   'Duplicate'
            combo:  'ctrl+d' 
            cb:     @duplicateFile
        ,
            text:   'Move to Trash'
            combo:  'ctrl+backspace' 
            cb:     @moveToTrash
        ,
            text:   'Add to Shelf'
            combo:  'alt+shift+.'
            cb:     @addToShelf
        ,
            text:   'Explorer'
            combo:  'alt+e' 
            cb:     @explorer
        ,
            text:   'Open'
            combo:  'alt+o' 
            cb:     @open
        ]
        
        opt.items = opt.items.concat window.titlebar.makeTemplate require './menu.json'
        
        opt.x = absPos.x
        opt.y = absPos.y
        popup.menu opt        
        
    # 000   000  00000000  000   000  
    # 000  000   000        000 000   
    # 0000000    0000000     00000    
    # 000  000   000          000     
    # 000   000  00000000     000     
    
    onKey: (event) =>
        
        { mod, key, combo, char } = keyinfo.forEvent event

        switch combo
            when 'shift+`' '~'                      then return stopEvent event, @browser.browse '~'
            when '/'                                then return stopEvent event, @browser.browse '/'
            when 'alt+e'                            then return @explorer()
            when 'alt+o'                            then return @open()
            when 'page up' 'page down' 'home' 'end' then return stopEvent event, @navigateRows key
            when 'command+up' 'ctrl+up'             then return stopEvent event, @navigateRows 'home'
            when 'command+down' 'ctrl+down'         then return stopEvent event, @navigateRows 'end'
            when 'enter''alt+up'                    then return stopEvent event, @navigateCols key
            when 'alt+left'                         then return stopEvent event, $('shelf')?.focus?()
            when 'alt+shift+left'                   then return stopEvent event, @browser.toggleShelf()
            when 'backspace' 'delete'               then return stopEvent event, @browser.onBackspaceInColumn @
            when 'ctrl+t'                           then return stopEvent event, @sortByType()
            when 'ctrl+n'                           then return stopEvent event, @sortByName()
            when 'command+i' 'ctrl+i'               then return stopEvent event, @toggleDotFiles()
            when 'command+d' 'ctrl+d'               then return stopEvent event, @duplicateFile()
            when 'command+k' 'ctrl+k'               then return stopEvent event if @browser.cleanUp()
            when 'f2'                               then return stopEvent event, @activeRow()?.editName()
            when 'command+left' 'command+right' 'ctrl+left' 'ctrl+right'
                return stopEvent event, @navigateRoot key
            when 'command+backspace' 'ctrl+backspace' 'command+delete' 'ctrl+delete' 
                return stopEvent event, @moveToTrash()
            when 'tab'    
                if @search.length then @doSearch ''
                return stopEvent event
            when 'esc'
                if @search.length then @clearSearch()
                return stopEvent event

        if key in ['up'   'down']  then return stopEvent event, @navigateRows key              
        if key in ['left' 'right'] then return stopEvent event, @navigateCols key        
            
        if mod in ['shift' ''] and char then @doSearch char
                
module.exports = Column


