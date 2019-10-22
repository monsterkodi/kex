// koffee 1.4.0

/*
000   000  00000000   0000000   0000000    00000000  00000000   
000   000  000       000   000  000   000  000       000   000  
000000000  0000000   000000000  000   000  0000000   0000000    
000   000  000       000   000  000   000  000       000   000  
000   000  00000000  000   000  0000000    00000000  000   000
 */
var $, File, Header, elem, klog, kpos, ref, slash,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ref = require('kxk'), slash = ref.slash, elem = ref.elem, kpos = ref.kpos, klog = ref.klog, $ = ref.$;

File = require('./tools/file');

Header = (function() {
    function Header(browser) {
        this.browser = browser;
        this.onMouseUp = bind(this.onMouseUp, this);
        this.onMouseDown = bind(this.onMouseDown, this);
        this.elem = elem({
            "class": 'header'
        });
        this.elem.addEventListener('mousedown', this.onMouseDown);
        this.elem.addEventListener('mouseup', this.onMouseUp);
        $('crumbs').appendChild(this.elem);
        this.crumb = elem({
            "class": 'crumb'
        });
        this.elem.appendChild(this.crumb);
    }

    Header.prototype.del = function() {
        return this.elem.remove();
    };

    Header.prototype.onMouseDown = function(event) {
        return this.downPos = kpos(window.win.getBounds());
    };

    Header.prototype.onMouseUp = function(event) {
        var br, root, upPos;
        if (!this.downPos) {
            return;
        }
        upPos = kpos(window.win.getBounds());
        if (upPos.to(this.downPos).length() > 0) {
            delete this.downPos;
            return;
        }
        if (event.target.id) {
            this.browser.browse(event.target.id);
        } else {
            root = this.crumb.firstChild;
            br = root.getBoundingClientRect();
            if (kpos(event).x < br.left) {
                this.browser.browse(root.id);
            } else {
                this.browser.browse(this.file);
            }
        }
        return delete this.downPos;
    };

    Header.prototype.setFile = function(file) {
        this.file = file;
        return this.crumb.innerHTML = File.crumbSpan(slash.tilde(this.file));
    };

    return Header;

})();

module.exports = Header;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhZGVyLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw2Q0FBQTtJQUFBOztBQVFBLE1BQWlDLE9BQUEsQ0FBUSxLQUFSLENBQWpDLEVBQUUsaUJBQUYsRUFBUyxlQUFULEVBQWUsZUFBZixFQUFxQixlQUFyQixFQUEyQjs7QUFFM0IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxjQUFSOztBQUVEO0lBRUMsZ0JBQUMsT0FBRDtRQUFDLElBQUMsQ0FBQSxVQUFEOzs7UUFFQSxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUEsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sUUFBTjtTQUFMO1FBQ1IsSUFBQyxDQUFBLElBQUksQ0FBQyxnQkFBTixDQUF1QixXQUF2QixFQUFtQyxJQUFDLENBQUEsV0FBcEM7UUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLGdCQUFOLENBQXVCLFNBQXZCLEVBQW1DLElBQUMsQ0FBQSxTQUFwQztRQUNBLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxXQUFaLENBQXdCLElBQUMsQ0FBQSxJQUF6QjtRQUVBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBQSxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxPQUFOO1NBQUw7UUFDVCxJQUFDLENBQUEsSUFBSSxDQUFDLFdBQU4sQ0FBa0IsSUFBQyxDQUFBLEtBQW5CO0lBUkQ7O3FCQVVILEdBQUEsR0FBSyxTQUFBO2VBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQUE7SUFBSDs7cUJBRUwsV0FBQSxHQUFhLFNBQUMsS0FBRDtlQUVULElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQSxDQUFLLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBWCxDQUFBLENBQUw7SUFGRjs7cUJBSWIsU0FBQSxHQUFXLFNBQUMsS0FBRDtBQUVQLFlBQUE7UUFBQSxJQUFVLENBQUksSUFBQyxDQUFBLE9BQWY7QUFBQSxtQkFBQTs7UUFFQSxLQUFBLEdBQVEsSUFBQSxDQUFLLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBWCxDQUFBLENBQUw7UUFFUixJQUFHLEtBQUssQ0FBQyxFQUFOLENBQVMsSUFBQyxDQUFBLE9BQVYsQ0FBa0IsQ0FBQyxNQUFuQixDQUFBLENBQUEsR0FBOEIsQ0FBakM7WUFDSSxPQUFPLElBQUMsQ0FBQTtBQUNSLG1CQUZKOztRQUlBLElBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFoQjtZQUNJLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixLQUFLLENBQUMsTUFBTSxDQUFDLEVBQTdCLEVBREo7U0FBQSxNQUFBO1lBR0ksSUFBQSxHQUFPLElBQUMsQ0FBQSxLQUFLLENBQUM7WUFDZCxFQUFBLEdBQUssSUFBSSxDQUFDLHFCQUFMLENBQUE7WUFDTCxJQUFHLElBQUEsQ0FBSyxLQUFMLENBQVcsQ0FBQyxDQUFaLEdBQWdCLEVBQUUsQ0FBQyxJQUF0QjtnQkFDSSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsSUFBSSxDQUFDLEVBQXJCLEVBREo7YUFBQSxNQUFBO2dCQUdJLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixJQUFDLENBQUEsSUFBakIsRUFISjthQUxKOztlQVVBLE9BQU8sSUFBQyxDQUFBO0lBcEJEOztxQkFzQlgsT0FBQSxHQUFTLFNBQUMsSUFBRDtRQUFDLElBQUMsQ0FBQSxPQUFEO2VBRU4sSUFBQyxDQUFBLEtBQUssQ0FBQyxTQUFQLEdBQW1CLElBQUksQ0FBQyxTQUFMLENBQWUsS0FBSyxDQUFDLEtBQU4sQ0FBWSxJQUFDLENBQUEsSUFBYixDQUFmO0lBRmQ7Ozs7OztBQUliLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIyNcblxueyBzbGFzaCwgZWxlbSwga3Bvcywga2xvZywgJCB9ID0gcmVxdWlyZSAna3hrJ1xuXG5GaWxlID0gcmVxdWlyZSAnLi90b29scy9maWxlJ1xuXG5jbGFzcyBIZWFkZXJcblxuICAgIEA6IChAYnJvd3NlcikgLT5cbiAgICAgICAgXG4gICAgICAgIEBlbGVtID0gZWxlbSBjbGFzczonaGVhZGVyJ1xuICAgICAgICBAZWxlbS5hZGRFdmVudExpc3RlbmVyICdtb3VzZWRvd24nIEBvbk1vdXNlRG93blxuICAgICAgICBAZWxlbS5hZGRFdmVudExpc3RlbmVyICdtb3VzZXVwJyAgIEBvbk1vdXNlVXBcbiAgICAgICAgJCgnY3J1bWJzJykuYXBwZW5kQ2hpbGQgQGVsZW1cbiAgICAgICAgXG4gICAgICAgIEBjcnVtYiA9IGVsZW0gY2xhc3M6J2NydW1iJ1xuICAgICAgICBAZWxlbS5hcHBlbmRDaGlsZCBAY3J1bWJcblxuICAgIGRlbDogLT4gQGVsZW0ucmVtb3ZlKClcbiAgICBcbiAgICBvbk1vdXNlRG93bjogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgQGRvd25Qb3MgPSBrcG9zIHdpbmRvdy53aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgICAgIFxuICAgIG9uTW91c2VVcDogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAZG93blBvc1xuICAgICAgICBcbiAgICAgICAgdXBQb3MgPSBrcG9zIHdpbmRvdy53aW4uZ2V0Qm91bmRzKClcbiAgICAgICAgXG4gICAgICAgIGlmIHVwUG9zLnRvKEBkb3duUG9zKS5sZW5ndGgoKSA+IDBcbiAgICAgICAgICAgIGRlbGV0ZSBAZG93blBvc1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBpZiBldmVudC50YXJnZXQuaWRcbiAgICAgICAgICAgIEBicm93c2VyLmJyb3dzZSBldmVudC50YXJnZXQuaWRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcm9vdCA9IEBjcnVtYi5maXJzdENoaWxkXG4gICAgICAgICAgICBiciA9IHJvb3QuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICAgIGlmIGtwb3MoZXZlbnQpLnggPCBici5sZWZ0XG4gICAgICAgICAgICAgICAgQGJyb3dzZXIuYnJvd3NlIHJvb3QuaWRcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAYnJvd3Nlci5icm93c2UgQGZpbGVcbiAgICAgICAgICAgIFxuICAgICAgICBkZWxldGUgQGRvd25Qb3NcbiAgICAgICAgXG4gICAgc2V0RmlsZTogKEBmaWxlKSAtPlxuICAgICAgICBcbiAgICAgICAgQGNydW1iLmlubmVySFRNTCA9IEZpbGUuY3J1bWJTcGFuIHNsYXNoLnRpbGRlIEBmaWxlXG4gICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gSGVhZGVyXG4iXX0=
//# sourceURL=../coffee/header.coffee