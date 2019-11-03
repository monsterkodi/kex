// koffee 1.4.0
var _, kerror, post, ref,
    indexOf = [].indexOf;

ref = require('kxk'), post = ref.post, kerror = ref.kerror, _ = ref._;

module.exports = {
    actions: {
        menu: 'Select',
        selectAll: {
            name: 'Select All',
            combo: 'command+a',
            accel: 'ctrl+a'
        },
        selectNone: {
            name: 'Deselect',
            combo: 'command+shift+a',
            accel: 'ctrl+shift+a'
        },
        selectInverted: {
            name: 'Invert Selection',
            text: 'selects all lines that have no cursors and no selections',
            combo: 'command+shift+i',
            accel: 'ctrl+shift+i'
        },
        selectNextHighlight: {
            separator: true,
            name: 'Select Next Highlight',
            combo: 'command+g',
            accel: 'ctrl+g'
        },
        selectPrevHighlight: {
            name: 'Select Previous Highlight',
            combo: 'command+shift+g',
            accel: 'ctrl+shift+g'
        },
        selectTextBetweenCursorsOrSurround: {
            name: 'Select Between Cursors, Brackets or Quotes',
            text: "select text between even cursors, if at least two cursors exist. \nselect text between highlighted brackets or quotes otherwise.",
            combo: 'command+alt+b',
            accel: 'alt+ctrl+b'
        },
        toggleStickySelection: {
            separator: true,
            name: 'Toggle Sticky Selection',
            text: 'current selection is not removed when adding new selections',
            combo: 'command+`',
            accel: "ctrl+'"
        }
    },
    selectSingleRange: function(r, opt) {
        var cursorX;
        if (r == null) {
            return kerror("Editor." + name + ".selectSingleRange -- undefined range!");
        }
        cursorX = (opt != null ? opt.before : void 0) ? r[1][0] : r[1][1];
        this["do"].start();
        this["do"].setCursors([[cursorX, r[0]]]);
        this["do"].select([r]);
        this["do"].end();
        return this;
    },
    toggleStickySelection: function() {
        if (this.stickySelection) {
            return this.endStickySelection();
        } else {
            return this.startStickySelection();
        }
    },
    startStickySelection: function() {
        this.stickySelection = true;
        post.emit('sticky', true);
        return this.emit('selection');
    },
    endStickySelection: function() {
        this.stickySelection = false;
        post.emit('sticky', false);
        return this.emit('selection');
    },
    startSelection: function(opt) {
        var c, j, len, ref1, sel;
        if (opt == null) {
            opt = {
                extend: false
            };
        }
        if (!(opt != null ? opt.extend : void 0)) {
            this.startSelectionCursors = null;
            if (!this.stickySelection) {
                this["do"].select([]);
            }
            return;
        }
        if (!this.startSelectionCursors || this.numCursors() !== this.startSelectionCursors.length) {
            this.startSelectionCursors = this["do"].cursors();
            if (this.numSelections()) {
                ref1 = this.startSelectionCursors;
                for (j = 0, len = ref1.length; j < len; j++) {
                    c = ref1[j];
                    if (sel = this.continuousSelectionAtPosInRanges(c, this["do"].selections())) {
                        if (isSamePos(sel[1], c)) {
                            c[0] = sel[0][0];
                            c[1] = sel[0][1];
                        }
                    }
                }
            }
            if (!this.stickySelection) {
                return this["do"].select(rangesFromPositions(this.startSelectionCursors));
            }
        }
    },
    endSelection: function(opt) {
        var ci, j, nc, newCursors, newSelection, oc, oldCursors, ranges, ref1, ref2;
        if (opt == null) {
            opt = {
                extend: false
            };
        }
        if (!(opt != null ? opt.extend : void 0)) {
            this.startSelectionCursors = null;
            if (!this.stickySelection) {
                this["do"].select([]);
            }
        } else {
            oldCursors = (ref1 = this.startSelectionCursors) != null ? ref1 : this["do"].cursors();
            newSelection = this.stickySelection && this["do"].selections() || [];
            newCursors = this["do"].cursors();
            if (oldCursors.length !== newCursors.length) {
                return kerror("Editor." + this.name + ".endSelection -- oldCursors.size != newCursors.size", oldCursors.length, newCursors.length);
            }
            for (ci = j = 0, ref2 = this["do"].numCursors(); 0 <= ref2 ? j < ref2 : j > ref2; ci = 0 <= ref2 ? ++j : --j) {
                oc = oldCursors[ci];
                nc = newCursors[ci];
                if ((oc == null) || (nc == null)) {
                    return kerror("Editor." + this.name + ".endSelection -- invalid cursors", oc, nc);
                } else {
                    ranges = this.rangesForLinesBetweenPositions(oc, nc, true);
                    newSelection = newSelection.concat(ranges);
                }
            }
            this["do"].select(newSelection);
        }
        return this.checkSalterMode();
    },
    addRangeToSelection: function(range) {
        var newSelections;
        this["do"].start();
        newSelections = this["do"].selections();
        newSelections.push(range);
        this["do"].setCursors(endPositionsFromRanges(newSelections), {
            main: 'last'
        });
        this["do"].select(newSelections);
        return this["do"].end();
    },
    removeSelectionAtIndex: function(si) {
        var newCursors, newSelections;
        this["do"].start();
        newSelections = this["do"].selections();
        newSelections.splice(si, 1);
        if (newSelections.length) {
            newCursors = endPositionsFromRanges(newSelections);
            this["do"].setCursors(newCursors, {
                main: (newCursors.length + si - 1) % newCursors.length
            });
        }
        this["do"].select(newSelections);
        return this["do"].end();
    },
    selectNone: function() {
        this["do"].start();
        this["do"].select([]);
        return this["do"].end();
    },
    selectAll: function() {
        this["do"].start();
        this["do"].select(this.rangesForAllLines());
        return this["do"].end();
    },
    selectInverted: function() {
        var invertedRanges, j, li, ref1, sc;
        invertedRanges = [];
        sc = this.selectedAndCursorLineIndices();
        for (li = j = 0, ref1 = this.numLines(); 0 <= ref1 ? j < ref1 : j > ref1; li = 0 <= ref1 ? ++j : --j) {
            if (indexOf.call(sc, li) < 0) {
                invertedRanges.push(this.rangeForLineAtIndex(li));
            }
        }
        if (invertedRanges.length) {
            this["do"].start();
            this["do"].setCursors([rangeStartPos(_.first(invertedRanges))]);
            this["do"].select(invertedRanges);
            return this["do"].end();
        }
    },
    selectTextBetweenCursorsOrSurround: function() {
        var c0, c1, i, j, newCursors, newSelections, oldCursors, ref1;
        if (this.numCursors() && this.numCursors() % 2 === 0) {
            this["do"].start();
            newSelections = [];
            newCursors = [];
            oldCursors = this["do"].cursors();
            for (i = j = 0, ref1 = oldCursors.length; j < ref1; i = j += 2) {
                c0 = oldCursors[i];
                c1 = oldCursors[i + 1];
                newSelections = newSelections.concat(this.rangesForLinesBetweenPositions(c0, c1));
                newCursors.push(c1);
            }
            this["do"].setCursors(newCursors);
            this["do"].select(newSelections);
            return this["do"].end();
        } else {
            return this.selectBetweenSurround();
        }
    },
    selectBetweenSurround: function() {
        var end, s, start, surr;
        if (surr = this.highlightsSurroundingCursor()) {
            this["do"].start();
            start = rangeEndPos(surr[0]);
            end = rangeStartPos(surr[1]);
            s = this.rangesForLinesBetweenPositions(start, end);
            s = cleanRanges(s);
            if (s.length) {
                this["do"].select(s);
                if (this["do"].numSelections()) {
                    this["do"].setCursors([rangeEndPos(_.last(s))], {
                        Main: 'closest'
                    });
                }
            }
            return this["do"].end();
        }
    },
    selectSurround: function() {
        var r, surr;
        if (surr = this.highlightsSurroundingCursor()) {
            this["do"].start();
            this["do"].select(surr);
            if (this["do"].numSelections()) {
                this["do"].setCursors((function() {
                    var j, len, ref1, results;
                    ref1 = this["do"].selections();
                    results = [];
                    for (j = 0, len = ref1.length; j < len; j++) {
                        r = ref1[j];
                        results.push(rangeEndPos(r));
                    }
                    return results;
                }).call(this), {
                    main: 'closest'
                });
            }
            return this["do"].end();
        }
    },
    selectNextHighlight: function() {
        var r, ref1, ref2, searchText;
        if (!this.numHighlights() && (typeof window !== "undefined" && window !== null)) {
            searchText = (ref1 = window.commandline.commands.find) != null ? ref1.currentText : void 0;
            if (searchText != null ? searchText.length : void 0) {
                this.highlightText(searchText);
            }
        }
        if (!this.numHighlights()) {
            return;
        }
        r = rangeAfterPosInRanges(this.cursorPos(), this.highlights());
        if (r != null) {
            r;
        } else {
            r = this.highlight(0);
        }
        if (r != null) {
            this.selectSingleRange(r, {
                before: ((ref2 = r[2]) != null ? ref2.clss : void 0) === 'close'
            });
            return typeof this.scrollCursorIntoView === "function" ? this.scrollCursorIntoView() : void 0;
        }
    },
    selectPrevHighlight: function() {
        var hs, r, ref1, searchText;
        if (!this.numHighlights() && (typeof window !== "undefined" && window !== null)) {
            searchText = (ref1 = window.commandline.commands.find) != null ? ref1.currentText : void 0;
            if (searchText != null ? searchText.length : void 0) {
                this.highlightText(searchText);
            }
        }
        if (!this.numHighlights()) {
            return;
        }
        hs = this.highlights();
        r = rangeBeforePosInRanges(this.cursorPos(), hs);
        if (r != null) {
            r;
        } else {
            r = _.last(hs);
        }
        if (r != null) {
            return this.selectSingleRange(r);
        }
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBT0EsSUFBQSxvQkFBQTtJQUFBOztBQUFBLE1BQXNCLE9BQUEsQ0FBUSxLQUFSLENBQXRCLEVBQUUsZUFBRixFQUFRLG1CQUFSLEVBQWdCOztBQUVoQixNQUFNLENBQUMsT0FBUCxHQUVJO0lBQUEsT0FBQSxFQUNJO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFFQSxTQUFBLEVBQ0k7WUFBQSxJQUFBLEVBQU8sWUFBUDtZQUNBLEtBQUEsRUFBTyxXQURQO1lBRUEsS0FBQSxFQUFPLFFBRlA7U0FISjtRQU9BLFVBQUEsRUFDSTtZQUFBLElBQUEsRUFBTyxVQUFQO1lBQ0EsS0FBQSxFQUFPLGlCQURQO1lBRUEsS0FBQSxFQUFPLGNBRlA7U0FSSjtRQVlBLGNBQUEsRUFDSTtZQUFBLElBQUEsRUFBTyxrQkFBUDtZQUNBLElBQUEsRUFBTywwREFEUDtZQUVBLEtBQUEsRUFBTyxpQkFGUDtZQUdBLEtBQUEsRUFBTyxjQUhQO1NBYko7UUFrQkEsbUJBQUEsRUFDSTtZQUFBLFNBQUEsRUFBVyxJQUFYO1lBQ0EsSUFBQSxFQUFPLHVCQURQO1lBRUEsS0FBQSxFQUFPLFdBRlA7WUFHQSxLQUFBLEVBQU8sUUFIUDtTQW5CSjtRQXdCQSxtQkFBQSxFQUNJO1lBQUEsSUFBQSxFQUFPLDJCQUFQO1lBQ0EsS0FBQSxFQUFPLGlCQURQO1lBRUEsS0FBQSxFQUFPLGNBRlA7U0F6Qko7UUE2QkEsa0NBQUEsRUFDSTtZQUFBLElBQUEsRUFBTSw0Q0FBTjtZQUNBLElBQUEsRUFBTSxrSUFETjtZQUtBLEtBQUEsRUFBTyxlQUxQO1lBTUEsS0FBQSxFQUFPLFlBTlA7U0E5Qko7UUFzQ0EscUJBQUEsRUFDSTtZQUFBLFNBQUEsRUFBVyxJQUFYO1lBQ0EsSUFBQSxFQUFPLHlCQURQO1lBRUEsSUFBQSxFQUFPLDZEQUZQO1lBR0EsS0FBQSxFQUFPLFdBSFA7WUFJQSxLQUFB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LGFBQUQsQ0FBQSxDQUFkO0FBQUEsbUJBQUE7O1FBQ0EsQ0FBQSxHQUFJLHFCQUFBLENBQXNCLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBdEIsRUFBb0MsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUFwQzs7WUFDSjs7WUFBQSxJQUFLLElBQUMsQ0FBQSxTQUFELENBQVcsQ0FBWDs7UUFDTCxJQUFHLFNBQUg7WUFDSSxJQUFDLENBQUEsaUJBQUQsQ0FBbUIsQ0FBbkIsRUFBc0I7Z0JBQUEsTUFBQSwrQkFBWSxDQUFFLGNBQU4sS0FBYyxPQUF0QjthQUF0QjtxRUFDQSxJQUFDLENBQUEsZ0NBRkw7O0lBUmlCLENBeFByQjtJQW9RQSxtQkFBQSxFQUFxQixTQUFBO0FBRWpCLFlBQUE7UUFBQSxJQUFHLENBQUksSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFKLElBQXlCLGtEQUE1QjtZQUNJLFVBQUEsMkRBQTZDLENBQUU7WUFDL0MseUJBQTZCLFVBQVUsQ0FBRSxlQUF6QztnQkFBQSxJQUFDLENBQUEsYUFBRCxDQUFlLFVBQWYsRUFBQTthQUZKOztRQUdBLElBQVUsQ0FBSSxJQUFDLENBQUEsYUFBRCxDQUFBLENBQWQ7QUFBQSxtQkFBQTs7UUFDQSxFQUFBLEdBQUssSUFBQyxDQUFBLFVBQUQsQ0FBQTtRQUNMLENBQUEsR0FBSSxzQkFBQSxDQUF1QixJQUFDLENBQUEsU0FBRCxDQUFBLENBQXZCLEVBQXFDLEVBQXJDOztZQUNKOztZQUFBLElBQUssQ0FBQyxDQUFDLElBQUYsQ0FBTyxFQUFQOztRQUNMLElBQXdCLFNBQXhCO21CQUFBLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixDQUFuQixFQUFBOztJQVRpQixDQXBRckIiLCJzb3VyY2VzQ29udGVudCI6WyJcbiMgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwXG4jIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiMgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuIyAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbnsgcG9zdCwga2Vycm9yLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgICBcbiAgICBhY3Rpb25zOlxuICAgICAgICBtZW51OiAnU2VsZWN0J1xuICAgICAgICBcbiAgICAgICAgc2VsZWN0QWxsOlxuICAgICAgICAgICAgbmFtZTogICdTZWxlY3QgQWxsJ1xuICAgICAgICAgICAgY29tYm86ICdjb21tYW5kK2EnXG4gICAgICAgICAgICBhY2NlbDogJ2N0cmwrYSdcbiAgICAgICAgICAgIFxuICAgICAgICBzZWxlY3ROb25lOlxuICAgICAgICAgICAgbmFtZTogICdEZXNlbGVjdCdcbiAgICAgICAgICAgIGNvbWJvOiAnY29tbWFuZCtzaGlmdCthJ1xuICAgICAgICAgICAgYWNjZWw6ICdjdHJsK3NoaWZ0K2EnXG4gICAgICAgICAgICBcbiAgICAgICAgc2VsZWN0SW52ZXJ0ZWQ6XG4gICAgICAgICAgICBuYW1lOiAgJ0ludmVydCBTZWxlY3Rpb24nXG4gICAgICAgICAgICB0ZXh0OiAgJ3NlbGVjdHMgYWxsIGxpbmVzIHRoYXQgaGF2ZSBubyBjdXJzb3JzIGFuZCBubyBzZWxlY3Rpb25zJ1xuICAgICAgICAgICAgY29tYm86ICdjb21tYW5kK3NoaWZ0K2knXG4gICAgICAgICAgICBhY2NlbDogJ2N0cmwrc2hpZnQraSdcbiAgICAgICAgICAgIFxuICAgICAgICBzZWxlY3ROZXh0SGlnaGxpZ2h0OlxuICAgICAgICAgICAgc2VwYXJhdG9yOiB0cnVlXG4gICAgICAgICAgICBuYW1lOiAgJ1NlbGVjdCBOZXh0IEhpZ2hsaWdodCdcbiAgICAgICAgICAgIGNvbWJvOiAnY29tbWFuZCtnJ1xuICAgICAgICAgICAgYWNjZWw6ICdjdHJsK2cnXG4gICAgICAgICAgICBcbiAgICAgICAgc2VsZWN0UHJldkhpZ2hsaWdodDpcbiAgICAgICAgICAgIG5hbWU6ICAnU2VsZWN0IFByZXZpb3VzIEhpZ2hsaWdodCdcbiAgICAgICAgICAgIGNvbWJvOiAnY29tbWFuZCtzaGlmdCtnJ1xuICAgICAgICAgICAgYWNjZWw6ICdjdHJsK3NoaWZ0K2cnXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgc2VsZWN0VGV4dEJldHdlZW5DdXJzb3JzT3JTdXJyb3VuZDpcbiAgICAgICAgICAgIG5hbWU6ICdTZWxlY3QgQmV0d2VlbiBDdXJzb3JzLCBCcmFja2V0cyBvciBRdW90ZXMnXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgICBzZWxlY3QgdGV4dCBiZXR3ZWVuIGV2ZW4gY3Vyc29ycywgaWYgYXQgbGVhc3QgdHdvIGN1cnNvcnMgZXhpc3QuIFxuICAgICAgICAgICAgICAgIHNlbGVjdCB0ZXh0IGJldHdlZW4gaGlnaGxpZ2h0ZWQgYnJhY2tldHMgb3IgcXVvdGVzIG90aGVyd2lzZS5cbiAgICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGNvbWJvOiAnY29tbWFuZCthbHQrYidcbiAgICAgICAgICAgIGFjY2VsOiAnYWx0K2N0cmwrYidcblxuICAgICAgICB0b2dnbGVTdGlja3lTZWxlY3Rpb246XG4gICAgICAgICAgICBzZXBhcmF0b3I6IHRydWVcbiAgICAgICAgICAgIG5hbWU6ICAnVG9nZ2xlIFN0aWNreSBTZWxlY3Rpb24nXG4gICAgICAgICAgICB0ZXh0OiAgJ2N1cnJlbnQgc2VsZWN0aW9uIGlzIG5vdCByZW1vdmVkIHdoZW4gYWRkaW5nIG5ldyBzZWxlY3Rpb25zJ1xuICAgICAgICAgICAgY29tYm86ICdjb21tYW5kK2AnXG4gICAgICAgICAgICBhY2NlbDogXCJjdHJsKydcIlxuICAgICAgICAgICAgXG4gICAgc2VsZWN0U2luZ2xlUmFuZ2U6IChyLCBvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBub3Qgcj9cbiAgICAgICAgICAgIHJldHVybiBrZXJyb3IgXCJFZGl0b3IuI3tuYW1lfS5zZWxlY3RTaW5nbGVSYW5nZSAtLSB1bmRlZmluZWQgcmFuZ2UhXCJcbiAgICAgICAgICAgIFxuICAgICAgICBjdXJzb3JYID0gaWYgb3B0Py5iZWZvcmUgdGhlbiByWzFdWzBdIGVsc2UgclsxXVsxXVxuICAgICAgICBAZG8uc3RhcnQoKVxuICAgICAgICBAZG8uc2V0Q3Vyc29ycyBbW2N1cnNvclgsIHJbMF1dXVxuICAgICAgICBAZG8uc2VsZWN0IFtyXVxuICAgICAgICBAZG8uZW5kKClcbiAgICAgICAgQFxuXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAwMDAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgICAgMDAwMDAgICAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgdG9nZ2xlU3RpY2t5U2VsZWN0aW9uOiAtPlxuXG4gICAgICAgIGlmIEBzdGlja3lTZWxlY3Rpb24gdGhlbiBAZW5kU3RpY2t5U2VsZWN0aW9uKClcbiAgICAgICAgZWxzZSBAc3RhcnRTdGlja3lTZWxlY3Rpb24oKVxuICAgIFxuICAgIHN0YXJ0U3RpY2t5U2VsZWN0aW9uOiAtPlxuICAgICAgICBcbiAgICAgICAgQHN0aWNreVNlbGVjdGlvbiA9IHRydWVcbiAgICAgICAgcG9zdC5lbWl0ICdzdGlja3knLCB0cnVlXG4gICAgICAgIEBlbWl0ICdzZWxlY3Rpb24nXG5cbiAgICBlbmRTdGlja3lTZWxlY3Rpb246IC0+XG4gICAgICAgIFxuICAgICAgICBAc3RpY2t5U2VsZWN0aW9uID0gZmFsc2VcbiAgICAgICAgcG9zdC5lbWl0ICdzdGlja3knLCBmYWxzZVxuICAgICAgICBAZW1pdCAnc2VsZWN0aW9uJ1xuXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAgICAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAgICAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgc3RhcnRTZWxlY3Rpb246IChvcHQgPSBleHRlbmQ6ZmFsc2UpIC0+XG5cbiAgICAgICAgaWYgbm90IG9wdD8uZXh0ZW5kXG4gICAgICAgICAgICBAc3RhcnRTZWxlY3Rpb25DdXJzb3JzID0gbnVsbFxuICAgICAgICAgICAgaWYgbm90IEBzdGlja3lTZWxlY3Rpb25cbiAgICAgICAgICAgICAgICBAZG8uc2VsZWN0IFtdXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICBpZiBub3QgQHN0YXJ0U2VsZWN0aW9uQ3Vyc29ycyBvciBAbnVtQ3Vyc29ycygpICE9IEBzdGFydFNlbGVjdGlvbkN1cnNvcnMubGVuZ3RoXG4gICAgICAgICAgICBAc3RhcnRTZWxlY3Rpb25DdXJzb3JzID0gQGRvLmN1cnNvcnMoKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBAbnVtU2VsZWN0aW9ucygpXG4gICAgICAgICAgICAgICAgZm9yIGMgaW4gQHN0YXJ0U2VsZWN0aW9uQ3Vyc29yc1xuICAgICAgICAgICAgICAgICAgICBpZiBzZWwgPSBAY29udGludW91c1NlbGVjdGlvbkF0UG9zSW5SYW5nZXMgYywgQGRvLnNlbGVjdGlvbnMoKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgaXNTYW1lUG9zIHNlbFsxXSwgY1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNbMF0gPSBzZWxbMF1bMF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjWzFdID0gc2VsWzBdWzFdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG5vdCBAc3RpY2t5U2VsZWN0aW9uXG4gICAgICAgICAgICAgICAgQGRvLnNlbGVjdCByYW5nZXNGcm9tUG9zaXRpb25zIEBzdGFydFNlbGVjdGlvbkN1cnNvcnNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgZW5kU2VsZWN0aW9uOiAob3B0ID0gZXh0ZW5kOmZhbHNlKSAtPlxuXG4gICAgICAgIGlmIG5vdCBvcHQ/LmV4dGVuZCBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQHN0YXJ0U2VsZWN0aW9uQ3Vyc29ycyA9IG51bGxcbiAgICAgICAgICAgIGlmIG5vdCBAc3RpY2t5U2VsZWN0aW9uXG4gICAgICAgICAgICAgICAgQGRvLnNlbGVjdCBbXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG9sZEN1cnNvcnMgICA9IEBzdGFydFNlbGVjdGlvbkN1cnNvcnMgPyBAZG8uY3Vyc29ycygpXG4gICAgICAgICAgICBuZXdTZWxlY3Rpb24gPSBAc3RpY2t5U2VsZWN0aW9uIGFuZCBAZG8uc2VsZWN0aW9ucygpIG9yIFtdICAgICAgICAgICAgXG4gICAgICAgICAgICBuZXdDdXJzb3JzICAgPSBAZG8uY3Vyc29ycygpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9sZEN1cnNvcnMubGVuZ3RoICE9IG5ld0N1cnNvcnMubGVuZ3RoXG4gICAgICAgICAgICAgICAgcmV0dXJuIGtlcnJvciBcIkVkaXRvci4je0BuYW1lfS5lbmRTZWxlY3Rpb24gLS0gb2xkQ3Vyc29ycy5zaXplICE9IG5ld0N1cnNvcnMuc2l6ZVwiLCBvbGRDdXJzb3JzLmxlbmd0aCwgbmV3Q3Vyc29ycy5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIGNpIGluIFswLi4uQGRvLm51bUN1cnNvcnMoKV1cbiAgICAgICAgICAgICAgICBvYyA9IG9sZEN1cnNvcnNbY2ldXG4gICAgICAgICAgICAgICAgbmMgPSBuZXdDdXJzb3JzW2NpXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG5vdCBvYz8gb3Igbm90IG5jP1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ga2Vycm9yIFwiRWRpdG9yLiN7QG5hbWV9LmVuZFNlbGVjdGlvbiAtLSBpbnZhbGlkIGN1cnNvcnNcIiwgb2MsIG5jXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByYW5nZXMgPSBAcmFuZ2VzRm9yTGluZXNCZXR3ZWVuUG9zaXRpb25zIG9jLCBuYywgdHJ1ZSAjPCBleHRlbmQgdG8gZnVsbCBsaW5lcyBpZiBjdXJzb3IgYXQgc3RhcnQgb2YgbGluZSAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgbmV3U2VsZWN0aW9uID0gbmV3U2VsZWN0aW9uLmNvbmNhdCByYW5nZXNcbiAgICBcbiAgICAgICAgICAgIEBkby5zZWxlY3QgbmV3U2VsZWN0aW9uXG4gICAgICAgICAgICBcbiAgICAgICAgQGNoZWNrU2FsdGVyTW9kZSgpICAgICAgXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgYWRkUmFuZ2VUb1NlbGVjdGlvbjogKHJhbmdlKSAtPlxuICAgICAgICBcbiAgICAgICAgQGRvLnN0YXJ0KClcbiAgICAgICAgbmV3U2VsZWN0aW9ucyA9IEBkby5zZWxlY3Rpb25zKClcbiAgICAgICAgbmV3U2VsZWN0aW9ucy5wdXNoIHJhbmdlXG4gICAgICAgIFxuICAgICAgICBAZG8uc2V0Q3Vyc29ycyBlbmRQb3NpdGlvbnNGcm9tUmFuZ2VzKG5ld1NlbGVjdGlvbnMpLCBtYWluOidsYXN0J1xuICAgICAgICBAZG8uc2VsZWN0IG5ld1NlbGVjdGlvbnNcbiAgICAgICAgQGRvLmVuZCgpXG5cbiAgICByZW1vdmVTZWxlY3Rpb25BdEluZGV4OiAoc2kpIC0+XG4gICAgICAgIFxuICAgICAgICBAZG8uc3RhcnQoKVxuICAgICAgICBuZXdTZWxlY3Rpb25zID0gQGRvLnNlbGVjdGlvbnMoKVxuICAgICAgICBuZXdTZWxlY3Rpb25zLnNwbGljZSBzaSwgMVxuICAgICAgICBpZiBuZXdTZWxlY3Rpb25zLmxlbmd0aFxuICAgICAgICAgICAgbmV3Q3Vyc29ycyA9IGVuZFBvc2l0aW9uc0Zyb21SYW5nZXMgbmV3U2VsZWN0aW9uc1xuICAgICAgICAgICAgQGRvLnNldEN1cnNvcnMgbmV3Q3Vyc29ycywgbWFpbjoobmV3Q3Vyc29ycy5sZW5ndGgrc2ktMSkgJSBuZXdDdXJzb3JzLmxlbmd0aFxuICAgICAgICBAZG8uc2VsZWN0IG5ld1NlbGVjdGlvbnNcbiAgICAgICAgQGRvLmVuZCgpICAgICAgICBcblxuICAgIHNlbGVjdE5vbmU6IC0+IFxuICAgICAgICBcbiAgICAgICAgQGRvLnN0YXJ0KClcbiAgICAgICAgQGRvLnNlbGVjdCBbXVxuICAgICAgICBAZG8uZW5kKClcbiAgICAgICAgXG4gICAgc2VsZWN0QWxsOiAtPlxuICAgICAgICBAZG8uc3RhcnQoKVxuICAgICAgICBAZG8uc2VsZWN0IEByYW5nZXNGb3JBbGxMaW5lcygpXG4gICAgICAgIEBkby5lbmQoKVxuICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgIDAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIHNlbGVjdEludmVydGVkOiAtPlxuICAgICAgICBcbiAgICAgICAgaW52ZXJ0ZWRSYW5nZXMgPSBbXSAgICAgICAgXG4gICAgICAgIHNjID0gQHNlbGVjdGVkQW5kQ3Vyc29yTGluZUluZGljZXMoKVxuICAgICAgICBmb3IgbGkgaW4gWzAuLi5AbnVtTGluZXMoKV1cbiAgICAgICAgICAgIGlmIGxpIG5vdCBpbiBzY1xuICAgICAgICAgICAgICAgIGludmVydGVkUmFuZ2VzLnB1c2ggQHJhbmdlRm9yTGluZUF0SW5kZXggbGlcbiAgICAgICAgaWYgaW52ZXJ0ZWRSYW5nZXMubGVuZ3RoXG4gICAgICAgICAgICBAZG8uc3RhcnQoKVxuICAgICAgICAgICAgQGRvLnNldEN1cnNvcnMgW3JhbmdlU3RhcnRQb3MgXy5maXJzdCBpbnZlcnRlZFJhbmdlc11cbiAgICAgICAgICAgIEBkby5zZWxlY3QgaW52ZXJ0ZWRSYW5nZXNcbiAgICAgICAgICAgIEBkby5lbmQoKSAgICAgXG5cbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHNlbGVjdFRleHRCZXR3ZWVuQ3Vyc29yc09yU3Vycm91bmQ6IC0+XG5cbiAgICAgICAgaWYgQG51bUN1cnNvcnMoKSBhbmQgQG51bUN1cnNvcnMoKSAlIDIgPT0gMCAgXG4gICAgICAgICAgICBAZG8uc3RhcnQoKVxuICAgICAgICAgICAgbmV3U2VsZWN0aW9ucyA9IFtdXG4gICAgICAgICAgICBuZXdDdXJzb3JzID0gW11cbiAgICAgICAgICAgIG9sZEN1cnNvcnMgPSBAZG8uY3Vyc29ycygpXG4gICAgICAgICAgICBmb3IgaSBpbiBbMC4uLm9sZEN1cnNvcnMubGVuZ3RoXSBieSAyXG4gICAgICAgICAgICAgICAgYzAgPSBvbGRDdXJzb3JzW2ldXG4gICAgICAgICAgICAgICAgYzEgPSBvbGRDdXJzb3JzW2krMV1cbiAgICAgICAgICAgICAgICBuZXdTZWxlY3Rpb25zID0gbmV3U2VsZWN0aW9ucy5jb25jYXQgQHJhbmdlc0ZvckxpbmVzQmV0d2VlblBvc2l0aW9ucyBjMCwgYzFcbiAgICAgICAgICAgICAgICBuZXdDdXJzb3JzLnB1c2ggYzFcbiAgICAgICAgICAgIEBkby5zZXRDdXJzb3JzIG5ld0N1cnNvcnNcbiAgICAgICAgICAgIEBkby5zZWxlY3QgbmV3U2VsZWN0aW9uc1xuICAgICAgICAgICAgQGRvLmVuZCgpXG4gICAgICAgIGVsc2UgQHNlbGVjdEJldHdlZW5TdXJyb3VuZCgpXG5cbiAgICBzZWxlY3RCZXR3ZWVuU3Vycm91bmQ6IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBzdXJyID0gQGhpZ2hsaWdodHNTdXJyb3VuZGluZ0N1cnNvcigpXG4gICAgICAgICAgICBAZG8uc3RhcnQoKVxuICAgICAgICAgICAgc3RhcnQgPSByYW5nZUVuZFBvcyBzdXJyWzBdXG4gICAgICAgICAgICBlbmQgPSByYW5nZVN0YXJ0UG9zIHN1cnJbMV1cbiAgICAgICAgICAgIHMgPSBAcmFuZ2VzRm9yTGluZXNCZXR3ZWVuUG9zaXRpb25zIHN0YXJ0LCBlbmRcbiAgICAgICAgICAgIHMgPSBjbGVhblJhbmdlcyBzXG4gICAgICAgICAgICBpZiBzLmxlbmd0aFxuICAgICAgICAgICAgICAgIEBkby5zZWxlY3Qgc1xuICAgICAgICAgICAgICAgIGlmIEBkby5udW1TZWxlY3Rpb25zKClcbiAgICAgICAgICAgICAgICAgICAgQGRvLnNldEN1cnNvcnMgW3JhbmdlRW5kUG9zKF8ubGFzdCBzKV0sIE1haW46ICdjbG9zZXN0J1xuICAgICAgICAgICAgQGRvLmVuZCgpXG4gICAgICAgICAgICBcbiAgICBzZWxlY3RTdXJyb3VuZDogLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHN1cnIgPSBAaGlnaGxpZ2h0c1N1cnJvdW5kaW5nQ3Vyc29yKClcbiAgICAgICAgICAgIEBkby5zdGFydCgpXG4gICAgICAgICAgICBAZG8uc2VsZWN0IHN1cnJcbiAgICAgICAgICAgIGlmIEBkby5udW1TZWxlY3Rpb25zKClcbiAgICAgICAgICAgICAgICBAZG8uc2V0Q3Vyc29ycyAocmFuZ2VFbmRQb3MocikgZm9yIHIgaW4gQGRvLnNlbGVjdGlvbnMoKSksIG1haW46ICdjbG9zZXN0J1xuICAgICAgICAgICAgQGRvLmVuZCgpXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICAgICBcbiAgICBzZWxlY3ROZXh0SGlnaGxpZ2h0OiAtPiAjIGNvbW1hbmQrZ1xuICAgICAgICBcbiAgICAgICAgaWYgbm90IEBudW1IaWdobGlnaHRzKCkgYW5kIHdpbmRvdz8gIyA8IHRoaXMgc3Vja3NcbiAgICAgICAgICAgIHNlYXJjaFRleHQgPSB3aW5kb3cuY29tbWFuZGxpbmUuY29tbWFuZHMuZmluZD8uY3VycmVudFRleHRcbiAgICAgICAgICAgIEBoaWdobGlnaHRUZXh0IHNlYXJjaFRleHQgaWYgc2VhcmNoVGV4dD8ubGVuZ3RoXG4gICAgICAgIHJldHVybiBpZiBub3QgQG51bUhpZ2hsaWdodHMoKVxuICAgICAgICByID0gcmFuZ2VBZnRlclBvc0luUmFuZ2VzIEBjdXJzb3JQb3MoKSwgQGhpZ2hsaWdodHMoKVxuICAgICAgICByID89IEBoaWdobGlnaHQgMFxuICAgICAgICBpZiByP1xuICAgICAgICAgICAgQHNlbGVjdFNpbmdsZVJhbmdlIHIsIGJlZm9yZTogclsyXT8uY2xzcyA9PSAnY2xvc2UnXG4gICAgICAgICAgICBAc2Nyb2xsQ3Vyc29ySW50b1ZpZXc/KCkgIyA8IHRoaXMgYWxzbyBzdWNrc1xuXG4gICAgc2VsZWN0UHJldkhpZ2hsaWdodDogLT4gIyBjb21tYW5kK3NoaWZ0K2dcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBAbnVtSGlnaGxpZ2h0cygpIGFuZCB3aW5kb3c/ICMgPCB0aGlzIHN1Y2tzXG4gICAgICAgICAgICBzZWFyY2hUZXh0ID0gd2luZG93LmNvbW1hbmRsaW5lLmNvbW1hbmRzLmZpbmQ/LmN1cnJlbnRUZXh0XG4gICAgICAgICAgICBAaGlnaGxpZ2h0VGV4dCBzZWFyY2hUZXh0IGlmIHNlYXJjaFRleHQ/Lmxlbmd0aFxuICAgICAgICByZXR1cm4gaWYgbm90IEBudW1IaWdobGlnaHRzKClcbiAgICAgICAgaHMgPSBAaGlnaGxpZ2h0cygpXG4gICAgICAgIHIgPSByYW5nZUJlZm9yZVBvc0luUmFuZ2VzIEBjdXJzb3JQb3MoKSwgaHNcbiAgICAgICAgciA/PSBfLmxhc3QgaHNcbiAgICAgICAgQHNlbGVjdFNpbmdsZVJhbmdlIHIgaWYgcj9cblxuIl19
//# sourceURL=../../../coffee/editor/actions/selection.coffee