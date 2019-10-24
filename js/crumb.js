// koffee 1.4.0

/*
 0000000  00000000   000   000  00     00  0000000  
000       000   000  000   000  000   000  000   000
000       0000000    000   000  000000000  0000000  
000       000   000  000   000  000 0 000  000   000
 0000000  000   000   0000000   000   000  0000000
 */
var $, Crumb, File, elem, klog, kpos, ref, slash,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ref = require('kxk'), slash = ref.slash, elem = ref.elem, kpos = ref.kpos, klog = ref.klog, $ = ref.$;

File = require('./tools/file');

Crumb = (function() {
    function Crumb(column) {
        this.column = column;
        this.onMouseUp = bind(this.onMouseUp, this);
        this.onMouseDown = bind(this.onMouseDown, this);
        this.elem = elem({
            "class": 'crumb'
        });
        this.elem.columnIndex = this.column.index;
        this.elem.addEventListener('mousedown', this.onMouseDown);
        this.elem.addEventListener('mouseup', this.onMouseUp);
        $('crumbs').appendChild(this.elem);
    }

    Crumb.prototype.onMouseDown = function(event) {
        return this.downPos = kpos(window.win.getBounds());
    };

    Crumb.prototype.onMouseUp = function(event) {
        var br, root, upPos;
        if (!this.downPos) {
            return;
        }
        upPos = kpos(window.win.getBounds());
        if (upPos.to(this.downPos).length() > 0) {
            delete this.downPos;
            this.column.focus();
            return;
        }
        if (this.column.index === 0) {
            if (event.target.id) {
                this.column.browser.browse(event.target.id);
            } else {
                root = this.elem.firstChild;
                br = root.getBoundingClientRect();
                if (kpos(event).x < br.left) {
                    this.column.browser.browse(root.id);
                } else {
                    this.column.browser.browse(this.column.parent.file);
                }
            }
        } else {
            this.column.makeRoot();
        }
        return delete this.downPos;
    };

    Crumb.prototype.setFile = function(file) {
        if (this.column.index === 0) {
            return this.elem.innerHTML = File.crumbSpan(slash.tilde(file));
        } else {
            return this.elem.innerHTML = slash.base(file);
        }
    };

    Crumb.prototype.clear = function() {
        return this.elem.innerHTML = '';
    };

    Crumb.prototype.updateRect = function(br) {
        var width;
        this.elem.style.left = br.left + "px";
        if (this.column.index === this.column.browser.numCols() - 1) {
            width = br.right - br.left - 135;
            this.elem.style.width = width + "px";
            if (width < 50) {
                return this.elem.style.display = 'none';
            } else {
                return this.elem.style.display = null;
            }
        } else {
            return this.elem.style.width = (br.right - br.left) + "px";
        }
    };

    return Crumb;

})();

module.exports = Crumb;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3J1bWIuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDRDQUFBO0lBQUE7O0FBUUEsTUFBaUMsT0FBQSxDQUFRLEtBQVIsQ0FBakMsRUFBRSxpQkFBRixFQUFTLGVBQVQsRUFBZSxlQUFmLEVBQXFCLGVBQXJCLEVBQTJCOztBQUUzQixJQUFBLEdBQU8sT0FBQSxDQUFRLGNBQVI7O0FBRUQ7SUFFQyxlQUFDLE1BQUQ7UUFBQyxJQUFDLENBQUEsU0FBRDs7O1FBRUEsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFBLENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLE9BQU47U0FBTDtRQUNSLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixHQUFvQixJQUFDLENBQUEsTUFBTSxDQUFDO1FBQzVCLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBdUIsV0FBdkIsRUFBbUMsSUFBQyxDQUFBLFdBQXBDO1FBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxnQkFBTixDQUF1QixTQUF2QixFQUFtQyxJQUFDLENBQUEsU0FBcEM7UUFDQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsV0FBWixDQUF3QixJQUFDLENBQUEsSUFBekI7SUFORDs7b0JBUUgsV0FBQSxHQUFhLFNBQUMsS0FBRDtlQUVULElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQSxDQUFLLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBWCxDQUFBLENBQUw7SUFGRjs7b0JBSWIsU0FBQSxHQUFXLFNBQUMsS0FBRDtBQUVQLFlBQUE7UUFBQSxJQUFVLENBQUksSUFBQyxDQUFBLE9BQWY7QUFBQSxtQkFBQTs7UUFFQSxLQUFBLEdBQVEsSUFBQSxDQUFLLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBWCxDQUFBLENBQUw7UUFFUixJQUFHLEtBQUssQ0FBQyxFQUFOLENBQVMsSUFBQyxDQUFBLE9BQVYsQ0FBa0IsQ0FBQyxNQUFuQixDQUFBLENBQUEsR0FBOEIsQ0FBakM7WUFDSSxPQUFPLElBQUMsQ0FBQTtZQUNSLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixDQUFBO0FBQ0EsbUJBSEo7O1FBS0EsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsS0FBaUIsQ0FBcEI7WUFDSSxJQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBaEI7Z0JBQ0ksSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBaEIsQ0FBdUIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFwQyxFQURKO2FBQUEsTUFBQTtnQkFHSSxJQUFBLEdBQU8sSUFBQyxDQUFBLElBQUksQ0FBQztnQkFDYixFQUFBLEdBQUssSUFBSSxDQUFDLHFCQUFMLENBQUE7Z0JBQ0wsSUFBRyxJQUFBLENBQUssS0FBTCxDQUFXLENBQUMsQ0FBWixHQUFnQixFQUFFLENBQUMsSUFBdEI7b0JBQ0ksSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBaEIsQ0FBdUIsSUFBSSxDQUFDLEVBQTVCLEVBREo7aUJBQUEsTUFBQTtvQkFHSSxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFoQixDQUF1QixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUF0QyxFQUhKO2lCQUxKO2FBREo7U0FBQSxNQUFBO1lBV0ksSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQUEsRUFYSjs7ZUFhQSxPQUFPLElBQUMsQ0FBQTtJQXhCRDs7b0JBMEJYLE9BQUEsR0FBUyxTQUFDLElBQUQ7UUFFTCxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixLQUFpQixDQUFwQjttQkFDSSxJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sR0FBa0IsSUFBSSxDQUFDLFNBQUwsQ0FBZSxLQUFLLENBQUMsS0FBTixDQUFZLElBQVosQ0FBZixFQUR0QjtTQUFBLE1BQUE7bUJBR0ksSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLEdBQWtCLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxFQUh0Qjs7SUFGSzs7b0JBT1QsS0FBQSxHQUFPLFNBQUE7ZUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLFNBQU4sR0FBa0I7SUFBckI7O29CQUVQLFVBQUEsR0FBWSxTQUFDLEVBQUQ7QUFFUixZQUFBO1FBQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBWixHQUFzQixFQUFFLENBQUMsSUFBSixHQUFTO1FBQzlCLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLEtBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQWhCLENBQUEsQ0FBQSxHQUEwQixDQUE5QztZQUNJLEtBQUEsR0FBUSxFQUFFLENBQUMsS0FBSCxHQUFXLEVBQUUsQ0FBQyxJQUFkLEdBQXFCO1lBQzdCLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQVosR0FBdUIsS0FBRCxHQUFPO1lBQzdCLElBQUcsS0FBQSxHQUFRLEVBQVg7dUJBQ0ksSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWixHQUFzQixPQUQxQjthQUFBLE1BQUE7dUJBR0ksSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWixHQUFzQixLQUgxQjthQUhKO1NBQUEsTUFBQTttQkFRSSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFaLEdBQXNCLENBQUMsRUFBRSxDQUFDLEtBQUgsR0FBVyxFQUFFLENBQUMsSUFBZixDQUFBLEdBQW9CLEtBUjlDOztJQUhROzs7Ozs7QUFhaEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAgICAgIDAwICAwMDAwMDAwICBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMCAgICAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDBcbiAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICBcbiMjI1xuXG57IHNsYXNoLCBlbGVtLCBrcG9zLCBrbG9nLCAkIH0gPSByZXF1aXJlICdreGsnXG5cbkZpbGUgPSByZXF1aXJlICcuL3Rvb2xzL2ZpbGUnXG5cbmNsYXNzIENydW1iXG5cbiAgICBAOiAoQGNvbHVtbikgLT5cbiAgICAgICAgXG4gICAgICAgIEBlbGVtID0gZWxlbSBjbGFzczonY3J1bWInXG4gICAgICAgIEBlbGVtLmNvbHVtbkluZGV4ID0gQGNvbHVtbi5pbmRleFxuICAgICAgICBAZWxlbS5hZGRFdmVudExpc3RlbmVyICdtb3VzZWRvd24nIEBvbk1vdXNlRG93blxuICAgICAgICBAZWxlbS5hZGRFdmVudExpc3RlbmVyICdtb3VzZXVwJyAgIEBvbk1vdXNlVXBcbiAgICAgICAgJCgnY3J1bWJzJykuYXBwZW5kQ2hpbGQgQGVsZW1cblxuICAgIG9uTW91c2VEb3duOiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBAZG93blBvcyA9IGtwb3Mgd2luZG93Lndpbi5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgXG4gICAgb25Nb3VzZVVwOiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IEBkb3duUG9zXG4gICAgICAgIFxuICAgICAgICB1cFBvcyA9IGtwb3Mgd2luZG93Lndpbi5nZXRCb3VuZHMoKVxuICAgICAgICBcbiAgICAgICAgaWYgdXBQb3MudG8oQGRvd25Qb3MpLmxlbmd0aCgpID4gMFxuICAgICAgICAgICAgZGVsZXRlIEBkb3duUG9zXG4gICAgICAgICAgICBAY29sdW1uLmZvY3VzKClcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICAgICAgaWYgQGNvbHVtbi5pbmRleCA9PSAwXG4gICAgICAgICAgICBpZiBldmVudC50YXJnZXQuaWRcbiAgICAgICAgICAgICAgICBAY29sdW1uLmJyb3dzZXIuYnJvd3NlIGV2ZW50LnRhcmdldC5pZFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJvb3QgPSBAZWxlbS5maXJzdENoaWxkXG4gICAgICAgICAgICAgICAgYnIgPSByb290LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgICAgICAgaWYga3BvcyhldmVudCkueCA8IGJyLmxlZnRcbiAgICAgICAgICAgICAgICAgICAgQGNvbHVtbi5icm93c2VyLmJyb3dzZSByb290LmlkXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAY29sdW1uLmJyb3dzZXIuYnJvd3NlIEBjb2x1bW4ucGFyZW50LmZpbGVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGNvbHVtbi5tYWtlUm9vdCgpXG4gICAgICAgICAgICBcbiAgICAgICAgZGVsZXRlIEBkb3duUG9zXG4gICAgICAgIFxuICAgIHNldEZpbGU6IChmaWxlKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgQGNvbHVtbi5pbmRleCA9PSAwXG4gICAgICAgICAgICBAZWxlbS5pbm5lckhUTUwgPSBGaWxlLmNydW1iU3BhbiBzbGFzaC50aWxkZSBmaWxlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBlbGVtLmlubmVySFRNTCA9IHNsYXNoLmJhc2UgZmlsZVxuICAgICAgICBcbiAgICBjbGVhcjogLT4gQGVsZW0uaW5uZXJIVE1MID0gJydcbiAgICBcbiAgICB1cGRhdGVSZWN0OiAoYnIpIC0+XG4gICAgICAgIFxuICAgICAgICBAZWxlbS5zdHlsZS5sZWZ0ID0gXCIje2JyLmxlZnR9cHhcIlxuICAgICAgICBpZiBAY29sdW1uLmluZGV4ID09IEBjb2x1bW4uYnJvd3Nlci5udW1Db2xzKCktMVxuICAgICAgICAgICAgd2lkdGggPSBici5yaWdodCAtIGJyLmxlZnQgLSAxMzVcbiAgICAgICAgICAgIEBlbGVtLnN0eWxlLndpZHRoID0gXCIje3dpZHRofXB4XCJcbiAgICAgICAgICAgIGlmIHdpZHRoIDwgNTBcbiAgICAgICAgICAgICAgICBAZWxlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQGVsZW0uc3R5bGUuZGlzcGxheSA9IG51bGxcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGVsZW0uc3R5bGUud2lkdGggPSBcIiN7YnIucmlnaHQgLSBici5sZWZ0fXB4XCJcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IENydW1iXG4iXX0=
//# sourceURL=../coffee/crumb.coffee