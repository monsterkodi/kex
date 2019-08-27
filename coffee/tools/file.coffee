###
00000000  000  000      00000000
000       000  000      000     
000000    000  000      0000000 
000       000  000      000     
000       000  0000000  00000000
###

{ slash, valid, klog, fs, kerror } = require 'kxk'

icons = require './icons.json'

class File
    
    @rename: (from, to, cb) ->
        
        fs.mkdir slash.dir(to), recursive:true, (err) ->
            return kerror 'mkdir failed' err if err
            fs.rename from, to, (err) ->
                return kerror 'rename failed' err if err
                cb to
    
    # 000   0000000   0000000   000   000  
    # 000  000       000   000  0000  000  
    # 000  000       000   000  000 0 000  
    # 000  000       000   000  000  0000  
    # 000   0000000   0000000   000   000  
    
    @iconClassName: (file) ->
        
        ext = slash.ext file
        switch ext
            when 'noon'   then className = 'icon noon'
            when 'koffee' then className = 'icon coffee'
            when 'xcf'    then className = 'icon gimp'
            else
                if clss = icons.ext[ext]
                    className = 'icon ' + clss
                    
        if not className
            if clss = icons.base[slash.base(file).toLowerCase()]
                className = 'icon ' + clss
        className ?= 'icon file'
        className
            
    #  0000000  00000000    0000000   000   000  
    # 000       000   000  000   000  0000  000  
    # 0000000   00000000   000000000  000 0 000  
    #      000  000        000   000  000  0000  
    # 0000000   000        000   000  000   000  
    
    @span: (text) ->
        
        base = slash.base text
        ext  = slash.ext(text).toLowerCase()
        clss = valid(ext) and ' '+ext or ''
        
        if base.startsWith '.' then clss += ' dotfile'
        
        span = "<span class='text#{clss}'>"+base+"</span>"
        
        if valid ext
            span += "<span class='ext punct#{clss}'>.</span>" + "<span class='ext text#{clss}'>"+ext+"</span>"
        span
        
    @crumbSpan: (file) ->
        
        return "<span>/</span>" if file in ['/' '']
        
        spans = []
        split = slash.split file
        
        for s in split[0...split.length-1]
            spans.push "<span class='path'>#{s}</span>"
        spans.push "<span>#{split[-1]}</span>"
        return spans.join "<span class='punct'>/</span>"
        
module.exports = File
