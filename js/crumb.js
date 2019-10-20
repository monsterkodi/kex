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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3J1bWIuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDRDQUFBO0lBQUE7O0FBUUEsTUFBaUMsT0FBQSxDQUFRLEtBQVIsQ0FBakMsRUFBRSxpQkFBRixFQUFTLGVBQVQsRUFBZSxlQUFmLEVBQXFCLGVBQXJCLEVBQTJCOztBQUUzQixJQUFBLEdBQU8sT0FBQSxDQUFRLGNBQVI7O0FBRUQ7SUFFQyxlQUFDLE1BQUQ7UUFBQyxJQUFDLENBQUEsU0FBRDs7O1FBRUEsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFBLENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLE9BQU47U0FBTDtRQUNSLElBQUMsQ0FBQSxJQUFJLENBQUMsV0FBTixHQUFvQixJQUFDLENBQUEsTUFBTSxDQUFDO1FBQzVCLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBdUIsV0FBdkIsRUFBbUMsSUFBQyxDQUFBLFdBQXBDO1FBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxnQkFBTixDQUF1QixTQUF2QixFQUFpQyxJQUFDLENBQUEsU0FBbEM7UUFDQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsV0FBWixDQUF3QixJQUFDLENBQUEsSUFBekI7SUFORDs7b0JBUUgsV0FBQSxHQUFhLFNBQUMsS0FBRDtlQUVULElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQSxDQUFLLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBWCxDQUFBLENBQUw7SUFGRjs7b0JBSWIsU0FBQSxHQUFXLFNBQUMsS0FBRDtBQUVQLFlBQUE7UUFBQSxJQUFVLENBQUksSUFBQyxDQUFBLE9BQWY7QUFBQSxtQkFBQTs7UUFFQSxLQUFBLEdBQVEsSUFBQSxDQUFLLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBWCxDQUFBLENBQUw7UUFFUixJQUFHLEtBQUssQ0FBQyxFQUFOLENBQVMsSUFBQyxDQUFBLE9BQVYsQ0FBa0IsQ0FBQyxNQUFuQixDQUFBLENBQUEsR0FBOEIsQ0FBakM7WUFDSSxPQUFPLElBQUMsQ0FBQTtBQUNSLG1CQUZKOztRQUlBLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLEtBQWlCLENBQXBCO1lBQ0ksSUFBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQWhCO2dCQUNJLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQWhCLENBQXVCLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBcEMsRUFESjthQUFBLE1BQUE7Z0JBR0ksSUFBQSxHQUFPLElBQUMsQ0FBQSxJQUFJLENBQUM7Z0JBQ2IsRUFBQSxHQUFLLElBQUksQ0FBQyxxQkFBTCxDQUFBO2dCQUNMLElBQUcsSUFBQSxDQUFLLEtBQUwsQ0FBVyxDQUFDLENBQVosR0FBZ0IsRUFBRSxDQUFDLElBQXRCO29CQUNJLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQWhCLENBQXVCLElBQUksQ0FBQyxFQUE1QixFQURKO2lCQUFBLE1BQUE7b0JBR0ksSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBaEIsQ0FBdUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBdEMsRUFISjtpQkFMSjthQURKO1NBQUEsTUFBQTtZQVdJLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFBLEVBWEo7O2VBYUEsT0FBTyxJQUFDLENBQUE7SUF2QkQ7O29CQXlCWCxPQUFBLEdBQVMsU0FBQyxJQUFEO1FBRUwsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsS0FBaUIsQ0FBcEI7bUJBQ0ksSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLEdBQWtCLElBQUksQ0FBQyxTQUFMLENBQWUsS0FBSyxDQUFDLEtBQU4sQ0FBWSxJQUFaLENBQWYsRUFEdEI7U0FBQSxNQUFBO21CQUdJLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBTixHQUFrQixLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsRUFIdEI7O0lBRks7O29CQU9ULEtBQUEsR0FBTyxTQUFBO2VBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLEdBQWtCO0lBQXJCOztvQkFFUCxVQUFBLEdBQVksU0FBQyxFQUFEO0FBRVIsWUFBQTtRQUFBLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQVosR0FBc0IsRUFBRSxDQUFDLElBQUosR0FBUztRQUM5QixJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixLQUFpQixJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFoQixDQUFBLENBQUEsR0FBMEIsQ0FBOUM7WUFDSSxLQUFBLEdBQVEsRUFBRSxDQUFDLEtBQUgsR0FBVyxFQUFFLENBQUMsSUFBZCxHQUFxQjtZQUM3QixJQUFDLENBQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFaLEdBQXVCLEtBQUQsR0FBTztZQUM3QixJQUFHLEtBQUEsR0FBUSxFQUFYO3VCQUNJLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVosR0FBc0IsT0FEMUI7YUFBQSxNQUFBO3VCQUdJLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVosR0FBc0IsS0FIMUI7YUFISjtTQUFBLE1BQUE7bUJBUUksSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBWixHQUFzQixDQUFDLEVBQUUsQ0FBQyxLQUFILEdBQVcsRUFBRSxDQUFDLElBQWYsQ0FBQSxHQUFvQixLQVI5Qzs7SUFIUTs7Ozs7O0FBYWhCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwICAgICAwMCAgMDAwMDAwMCAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAgICAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwXG4gMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG4jIyNcblxueyBzbGFzaCwgZWxlbSwga3Bvcywga2xvZywgJCB9ID0gcmVxdWlyZSAna3hrJ1xuXG5GaWxlID0gcmVxdWlyZSAnLi90b29scy9maWxlJ1xuXG5jbGFzcyBDcnVtYlxuXG4gICAgQDogKEBjb2x1bW4pIC0+XG4gICAgICAgIFxuICAgICAgICBAZWxlbSA9IGVsZW0gY2xhc3M6J2NydW1iJ1xuICAgICAgICBAZWxlbS5jb2x1bW5JbmRleCA9IEBjb2x1bW4uaW5kZXhcbiAgICAgICAgQGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vkb3duJyBAb25Nb3VzZURvd25cbiAgICAgICAgQGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcgQG9uTW91c2VVcFxuICAgICAgICAkKCdjcnVtYnMnKS5hcHBlbmRDaGlsZCBAZWxlbVxuXG4gICAgb25Nb3VzZURvd246IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIEBkb3duUG9zID0ga3BvcyB3aW5kb3cud2luLmdldEJvdW5kcygpXG4gICAgICAgICAgICBcbiAgICBvbk1vdXNlVXA6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgQGRvd25Qb3NcbiAgICAgICAgXG4gICAgICAgIHVwUG9zID0ga3BvcyB3aW5kb3cud2luLmdldEJvdW5kcygpXG4gICAgICAgIFxuICAgICAgICBpZiB1cFBvcy50byhAZG93blBvcykubGVuZ3RoKCkgPiAwXG4gICAgICAgICAgICBkZWxldGUgQGRvd25Qb3NcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICAgICAgaWYgQGNvbHVtbi5pbmRleCA9PSAwXG4gICAgICAgICAgICBpZiBldmVudC50YXJnZXQuaWRcbiAgICAgICAgICAgICAgICBAY29sdW1uLmJyb3dzZXIuYnJvd3NlIGV2ZW50LnRhcmdldC5pZFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJvb3QgPSBAZWxlbS5maXJzdENoaWxkXG4gICAgICAgICAgICAgICAgYnIgPSByb290LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgICAgICAgaWYga3BvcyhldmVudCkueCA8IGJyLmxlZnRcbiAgICAgICAgICAgICAgICAgICAgQGNvbHVtbi5icm93c2VyLmJyb3dzZSByb290LmlkXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAY29sdW1uLmJyb3dzZXIuYnJvd3NlIEBjb2x1bW4ucGFyZW50LmZpbGVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGNvbHVtbi5tYWtlUm9vdCgpXG4gICAgICAgICAgICBcbiAgICAgICAgZGVsZXRlIEBkb3duUG9zXG4gICAgICAgIFxuICAgIHNldEZpbGU6IChmaWxlKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgQGNvbHVtbi5pbmRleCA9PSAwXG4gICAgICAgICAgICBAZWxlbS5pbm5lckhUTUwgPSBGaWxlLmNydW1iU3BhbiBzbGFzaC50aWxkZSBmaWxlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBlbGVtLmlubmVySFRNTCA9IHNsYXNoLmJhc2UgZmlsZVxuICAgICAgICBcbiAgICBjbGVhcjogLT4gQGVsZW0uaW5uZXJIVE1MID0gJydcbiAgICBcbiAgICB1cGRhdGVSZWN0OiAoYnIpIC0+XG4gICAgICAgIFxuICAgICAgICBAZWxlbS5zdHlsZS5sZWZ0ID0gXCIje2JyLmxlZnR9cHhcIlxuICAgICAgICBpZiBAY29sdW1uLmluZGV4ID09IEBjb2x1bW4uYnJvd3Nlci5udW1Db2xzKCktMVxuICAgICAgICAgICAgd2lkdGggPSBici5yaWdodCAtIGJyLmxlZnQgLSAxMzVcbiAgICAgICAgICAgIEBlbGVtLnN0eWxlLndpZHRoID0gXCIje3dpZHRofXB4XCJcbiAgICAgICAgICAgIGlmIHdpZHRoIDwgNTBcbiAgICAgICAgICAgICAgICBAZWxlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQGVsZW0uc3R5bGUuZGlzcGxheSA9IG51bGxcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGVsZW0uc3R5bGUud2lkdGggPSBcIiN7YnIucmlnaHQgLSBici5sZWZ0fXB4XCJcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IENydW1iXG4iXX0=
//# sourceURL=../coffee/crumb.coffee