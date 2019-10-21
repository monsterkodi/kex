// koffee 1.4.0

/*
00000000  0000000    000  000000000   0000000   00000000   
000       000   000  000     000     000   000  000   000  
0000000   000   000  000     000     000   000  0000000    
000       000   000  000     000     000   000  000   000  
00000000  0000000    000     000      0000000   000   000
 */
var $, BaseEditor, Editor, File, FileEditor, _, elem, empty, keyinfo, klog, open, post, ref, slash, stopEvent,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ref = require('kxk'), slash = ref.slash, empty = ref.empty, post = ref.post, open = ref.open, elem = ref.elem, stopEvent = ref.stopEvent, keyinfo = ref.keyinfo, klog = ref.klog, $ = ref.$, _ = ref._;

File = require('./tools/file');

BaseEditor = require('./editor/editor');

FileEditor = require('./editor/fileeditor');

Editor = (function() {
    function Editor(path) {
        this.onMenuAction = bind(this.onMenuAction, this);
        this.close = bind(this.close, this);
        this.onKey = bind(this.onKey, this);
        var main;
        this.div = elem({
            "class": 'editor',
            tabindex: 1
        });
        this.focus = document.activeElement;
        main = $('#main');
        main.appendChild(this.div);
        this.editor = new FileEditor(this.div);
        post.on('menuAction', this.onMenuAction);
        this.div.addEventListener('keydown', this.onKey);
        this.div.focus();
        this.editor.setCurrentFile(path);
    }

    Editor.prototype.onKey = function(event) {
        var char, combo, key, mod, ref1;
        ref1 = keyinfo.forEvent(event), mod = ref1.mod, key = ref1.key, combo = ref1.combo, char = ref1.char;
        switch (combo) {
            case 'ctrl+w':
                return stopEvent(event, this.close());
        }
    };

    Editor.prototype.close = function() {
        this.div.remove();
        this.focus.focus();
        this.editor.del();
        return delete this.editor;
    };

    Editor.prototype.resized = function() {
        var ref1;
        return (ref1 = this.editor) != null ? ref1.resized() : void 0;
    };

    Editor.prototype.onMenuAction = function(name, args) {
        var action;
        if (!this.editor) {
            return;
        }
        klog("editor menu action! '" + name + "' args:", args);
        if (action = BaseEditor.actionWithName(name)) {
            if ((action.key != null) && _.isFunction(this.editor[action.key])) {
                this.editor[action.key](args.actarg);
                return;
            }
        }
        switch (name) {
            case 'Close Editor':
                return this.close();
            case 'Undo':
                return this.editor["do"].undo();
            case 'Redo':
                return this.editor["do"].redo();
            case 'Cut':
                return this.editor.cut();
            case 'Copy':
                return this.editor.copy();
            case 'Paste':
                return this.editor.paste();
            case 'Toggle Center Text':
                return toggleCenterText();
            case 'Increase':
                return changeFontSize(+1);
            case 'Decrease':
                return changeFontSize(-1);
            case 'Reset':
                return resetFontSize();
            case 'Save':
                return post.emit('saveFile');
            case 'Save As ...':
                return post.emit('saveFileAs');
            case 'Revert':
                return post.emit('reloadFile');
        }
        klog("unhandled menu action! '" + name + "' args:", args);
        return 'unhandled';
    };

    return Editor;

})();

module.exports = Editor;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSx5R0FBQTtJQUFBOztBQVFBLE1BQXFFLE9BQUEsQ0FBUSxLQUFSLENBQXJFLEVBQUUsaUJBQUYsRUFBUyxpQkFBVCxFQUFnQixlQUFoQixFQUFzQixlQUF0QixFQUE0QixlQUE1QixFQUFrQyx5QkFBbEMsRUFBNkMscUJBQTdDLEVBQXNELGVBQXRELEVBQTRELFNBQTVELEVBQStEOztBQUUvRCxJQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0FBQ2IsVUFBQSxHQUFhLE9BQUEsQ0FBUSxpQkFBUjs7QUFDYixVQUFBLEdBQWEsT0FBQSxDQUFRLHFCQUFSOztBQUVQO0lBRUMsZ0JBQUMsSUFBRDs7OztBQUVDLFlBQUE7UUFBQSxJQUFDLENBQUEsR0FBRCxHQUFPLElBQUEsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sUUFBTjtZQUFlLFFBQUEsRUFBUyxDQUF4QjtTQUFMO1FBRVAsSUFBQyxDQUFBLEtBQUQsR0FBUyxRQUFRLENBQUM7UUFFbEIsSUFBQSxHQUFNLENBQUEsQ0FBRSxPQUFGO1FBRU4sSUFBSSxDQUFDLFdBQUwsQ0FBaUIsSUFBQyxDQUFBLEdBQWxCO1FBRUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFJLFVBQUosQ0FBZSxJQUFDLENBQUEsR0FBaEI7UUFFVixJQUFJLENBQUMsRUFBTCxDQUFRLFlBQVIsRUFBcUIsSUFBQyxDQUFBLFlBQXRCO1FBRUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxnQkFBTCxDQUFzQixTQUF0QixFQUFnQyxJQUFDLENBQUEsS0FBakM7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUwsQ0FBQTtRQUVBLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUF1QixJQUF2QjtJQWpCRDs7cUJBeUJILEtBQUEsR0FBTyxTQUFDLEtBQUQ7QUFFSCxZQUFBO1FBQUEsT0FBNEIsT0FBTyxDQUFDLFFBQVIsQ0FBaUIsS0FBakIsQ0FBNUIsRUFBRSxjQUFGLEVBQU8sY0FBUCxFQUFZLGtCQUFaLEVBQW1CO0FBRW5CLGdCQUFPLEtBQVA7QUFBQSxpQkFDUyxRQURUO0FBQ3VCLHVCQUFPLFNBQUEsQ0FBVSxLQUFWLEVBQWlCLElBQUMsQ0FBQSxLQUFELENBQUEsQ0FBakI7QUFEOUI7SUFKRzs7cUJBT1AsS0FBQSxHQUFPLFNBQUE7UUFFSCxJQUFDLENBQUEsR0FBRyxDQUFDLE1BQUwsQ0FBQTtRQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsS0FBUCxDQUFBO1FBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQUE7ZUFDQSxPQUFPLElBQUMsQ0FBQTtJQUxMOztxQkFPUCxPQUFBLEdBQVMsU0FBQTtBQUFHLFlBQUE7a0RBQU8sQ0FBRSxPQUFULENBQUE7SUFBSDs7cUJBUVQsWUFBQSxHQUFjLFNBQUMsSUFBRCxFQUFPLElBQVA7QUFFVixZQUFBO1FBQUEsSUFBVSxDQUFJLElBQUMsQ0FBQSxNQUFmO0FBQUEsbUJBQUE7O1FBRUEsSUFBQSxDQUFLLHVCQUFBLEdBQXdCLElBQXhCLEdBQTZCLFNBQWxDLEVBQTJDLElBQTNDO1FBRUEsSUFBRyxNQUFBLEdBQVMsVUFBVSxDQUFDLGNBQVgsQ0FBMEIsSUFBMUIsQ0FBWjtZQUNJLElBQUcsb0JBQUEsSUFBZ0IsQ0FBQyxDQUFDLFVBQUYsQ0FBYSxJQUFDLENBQUEsTUFBTyxDQUFBLE1BQU0sQ0FBQyxHQUFQLENBQXJCLENBQW5CO2dCQUNJLElBQUMsQ0FBQSxNQUFPLENBQUEsTUFBTSxDQUFDLEdBQVAsQ0FBUixDQUFvQixJQUFJLENBQUMsTUFBekI7QUFDQSx1QkFGSjthQURKOztBQUtBLGdCQUFPLElBQVA7QUFBQSxpQkFFUyxjQUZUO0FBRXNDLHVCQUFPLElBQUMsQ0FBQSxLQUFELENBQUE7QUFGN0MsaUJBR1MsTUFIVDtBQUdzQyx1QkFBTyxJQUFDLENBQUEsTUFBTSxFQUFDLEVBQUQsRUFBRyxDQUFDLElBQVgsQ0FBQTtBQUg3QyxpQkFJUyxNQUpUO0FBSXNDLHVCQUFPLElBQUMsQ0FBQSxNQUFNLEVBQUMsRUFBRCxFQUFHLENBQUMsSUFBWCxDQUFBO0FBSjdDLGlCQUtTLEtBTFQ7QUFLc0MsdUJBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQUE7QUFMN0MsaUJBTVMsTUFOVDtBQU1zQyx1QkFBTyxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBQTtBQU43QyxpQkFPUyxPQVBUO0FBT3NDLHVCQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixDQUFBO0FBUDdDLGlCQVFTLG9CQVJUO0FBUXNDLHVCQUFPLGdCQUFBLENBQUE7QUFSN0MsaUJBU1MsVUFUVDtBQVNzQyx1QkFBTyxjQUFBLENBQWUsQ0FBQyxDQUFoQjtBQVQ3QyxpQkFVUyxVQVZUO0FBVXNDLHVCQUFPLGNBQUEsQ0FBZSxDQUFDLENBQWhCO0FBVjdDLGlCQVdTLE9BWFQ7QUFXc0MsdUJBQU8sYUFBQSxDQUFBO0FBWDdDLGlCQVlTLE1BWlQ7QUFZc0MsdUJBQU8sSUFBSSxDQUFDLElBQUwsQ0FBVSxVQUFWO0FBWjdDLGlCQWFTLGFBYlQ7QUFhc0MsdUJBQU8sSUFBSSxDQUFDLElBQUwsQ0FBVSxZQUFWO0FBYjdDLGlCQWNTLFFBZFQ7QUFjc0MsdUJBQU8sSUFBSSxDQUFDLElBQUwsQ0FBVSxZQUFWO0FBZDdDO1FBZ0JBLElBQUEsQ0FBSywwQkFBQSxHQUEyQixJQUEzQixHQUFnQyxTQUFyQyxFQUE4QyxJQUE5QztlQUNBO0lBNUJVOzs7Ozs7QUE4QmxCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMjI1xuXG57IHNsYXNoLCBlbXB0eSwgcG9zdCwgb3BlbiwgZWxlbSwgc3RvcEV2ZW50LCBrZXlpbmZvLCBrbG9nLCAkLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbkZpbGUgICAgICAgPSByZXF1aXJlICcuL3Rvb2xzL2ZpbGUnXG5CYXNlRWRpdG9yID0gcmVxdWlyZSAnLi9lZGl0b3IvZWRpdG9yJ1xuRmlsZUVkaXRvciA9IHJlcXVpcmUgJy4vZWRpdG9yL2ZpbGVlZGl0b3InXG5cbmNsYXNzIEVkaXRvclxuXG4gICAgQDogKHBhdGgpIC0+XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBAZGl2ID0gZWxlbSBjbGFzczonZWRpdG9yJyB0YWJpbmRleDoxXG4gICAgICAgIFxuICAgICAgICBAZm9jdXMgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50XG4gICAgICAgIFxuICAgICAgICBtYWluID0kICcjbWFpbidcbiAgICAgICAgICAgIFxuICAgICAgICBtYWluLmFwcGVuZENoaWxkIEBkaXZcbiAgICAgICAgXG4gICAgICAgIEBlZGl0b3IgPSBuZXcgRmlsZUVkaXRvciBAZGl2XG5cbiAgICAgICAgcG9zdC5vbiAnbWVudUFjdGlvbicgQG9uTWVudUFjdGlvblxuICAgICAgICBcbiAgICAgICAgQGRpdi5hZGRFdmVudExpc3RlbmVyICdrZXlkb3duJyBAb25LZXlcbiAgICAgICAgQGRpdi5mb2N1cygpXG4gICAgICAgIFxuICAgICAgICBAZWRpdG9yLnNldEN1cnJlbnRGaWxlIHBhdGhcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgb25LZXk6IChldmVudCkgPT5cblxuICAgICAgICB7IG1vZCwga2V5LCBjb21ibywgY2hhciB9ID0ga2V5aW5mby5mb3JFdmVudCBldmVudFxuXG4gICAgICAgIHN3aXRjaCBjb21ib1xuICAgICAgICAgICAgd2hlbiAnY3RybCt3JyB0aGVuIHJldHVybiBzdG9wRXZlbnQgZXZlbnQsIEBjbG9zZSgpXG4gICAgICAgICAgICBcbiAgICBjbG9zZTogPT5cblxuICAgICAgICBAZGl2LnJlbW92ZSgpXG4gICAgICAgIEBmb2N1cy5mb2N1cygpXG4gICAgICAgIEBlZGl0b3IuZGVsKClcbiAgICAgICAgZGVsZXRlIEBlZGl0b3JcbiAgICAgICAgXG4gICAgcmVzaXplZDogLT4gQGVkaXRvcj8ucmVzaXplZCgpXG4gICAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG4gICAgb25NZW51QWN0aW9uOiAobmFtZSwgYXJncykgPT5cblxuICAgICAgICByZXR1cm4gaWYgbm90IEBlZGl0b3JcbiAgICAgICAgXG4gICAgICAgIGtsb2cgXCJlZGl0b3IgbWVudSBhY3Rpb24hICcje25hbWV9JyBhcmdzOlwiIGFyZ3NcbiAgICAgICAgXG4gICAgICAgIGlmIGFjdGlvbiA9IEJhc2VFZGl0b3IuYWN0aW9uV2l0aE5hbWUgbmFtZVxuICAgICAgICAgICAgaWYgYWN0aW9uLmtleT8gYW5kIF8uaXNGdW5jdGlvbiBAZWRpdG9yW2FjdGlvbi5rZXldXG4gICAgICAgICAgICAgICAgQGVkaXRvclthY3Rpb24ua2V5XSBhcmdzLmFjdGFyZ1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgIFxuICAgICAgICBzd2l0Y2ggbmFtZVxuICAgIFxuICAgICAgICAgICAgd2hlbiAnQ2xvc2UgRWRpdG9yJyAgICAgICAgICB0aGVuIHJldHVybiBAY2xvc2UoKVxuICAgICAgICAgICAgd2hlbiAnVW5kbycgICAgICAgICAgICAgICAgICB0aGVuIHJldHVybiBAZWRpdG9yLmRvLnVuZG8oKVxuICAgICAgICAgICAgd2hlbiAnUmVkbycgICAgICAgICAgICAgICAgICB0aGVuIHJldHVybiBAZWRpdG9yLmRvLnJlZG8oKVxuICAgICAgICAgICAgd2hlbiAnQ3V0JyAgICAgICAgICAgICAgICAgICB0aGVuIHJldHVybiBAZWRpdG9yLmN1dCgpXG4gICAgICAgICAgICB3aGVuICdDb3B5JyAgICAgICAgICAgICAgICAgIHRoZW4gcmV0dXJuIEBlZGl0b3IuY29weSgpXG4gICAgICAgICAgICB3aGVuICdQYXN0ZScgICAgICAgICAgICAgICAgIHRoZW4gcmV0dXJuIEBlZGl0b3IucGFzdGUoKVxuICAgICAgICAgICAgd2hlbiAnVG9nZ2xlIENlbnRlciBUZXh0JyAgICB0aGVuIHJldHVybiB0b2dnbGVDZW50ZXJUZXh0KClcbiAgICAgICAgICAgIHdoZW4gJ0luY3JlYXNlJyAgICAgICAgICAgICAgdGhlbiByZXR1cm4gY2hhbmdlRm9udFNpemUgKzFcbiAgICAgICAgICAgIHdoZW4gJ0RlY3JlYXNlJyAgICAgICAgICAgICAgdGhlbiByZXR1cm4gY2hhbmdlRm9udFNpemUgLTFcbiAgICAgICAgICAgIHdoZW4gJ1Jlc2V0JyAgICAgICAgICAgICAgICAgdGhlbiByZXR1cm4gcmVzZXRGb250U2l6ZSgpXG4gICAgICAgICAgICB3aGVuICdTYXZlJyAgICAgICAgICAgICAgICAgIHRoZW4gcmV0dXJuIHBvc3QuZW1pdCAnc2F2ZUZpbGUnXG4gICAgICAgICAgICB3aGVuICdTYXZlIEFzIC4uLicgICAgICAgICAgIHRoZW4gcmV0dXJuIHBvc3QuZW1pdCAnc2F2ZUZpbGVBcydcbiAgICAgICAgICAgIHdoZW4gJ1JldmVydCcgICAgICAgICAgICAgICAgdGhlbiByZXR1cm4gcG9zdC5lbWl0ICdyZWxvYWRGaWxlJ1xuICAgIFxuICAgICAgICBrbG9nIFwidW5oYW5kbGVkIG1lbnUgYWN0aW9uISAnI3tuYW1lfScgYXJnczpcIiBhcmdzXG4gICAgICAgICd1bmhhbmRsZWQnXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvclxuIl19
//# sourceURL=../coffee/editor.coffee