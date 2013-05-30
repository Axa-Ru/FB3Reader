/// <reference path="FB3ReaderHead.ts" />
var FB3Reader;
(function (FB3Reader) {
    var ReaderPage = (function () {
        function ReaderPage(ColumnN, FB3DOM, FBReader) {
            this.ColumnN = ColumnN;
            this.FB3DOM = FB3DOM;
            this.FBReader = FBReader;
            this.Ready = false;
            this.PageN = 0;
        }
        ReaderPage.prototype.Show = // column number
        function () {
        };
        ReaderPage.prototype.Hide = function () {
        };
        ReaderPage.prototype.GetInitHTML = function (ID) {
            this.ID = ID;
            return '<div id="FB3ReaderColumn' + this.ID + '" class="FB2readerCell' + this.ColumnN + 'of' + this.FBReader.NColumns + ' FB2readerPage"><div class="FBReaderAbsDiv">...</div></div>';
        };
        ReaderPage.prototype.BindToHTMLDoc = function (Site) {
            this.Element = Site.getElementById('FB3ReaderColumn' + this.ID);
        };
        ReaderPage.prototype.DrawInit = function (StartPos, OnDrawDone) {
            var _this = this;
            var FragmentEnd = StartPos[0] + 10;
            if (FragmentEnd > this.FB3DOM.TOC[this.FB3DOM.TOC.length - 1].e) {
                FragmentEnd = this.FB3DOM.TOC[this.FB3DOM.TOC.length - 1].e;
            }
            var Range = {
                From: StartPos,
                To: [
                    FragmentEnd
                ]
            };
            this.OnDrawDone = OnDrawDone;
            this.FB3DOM.GetHTMLAsync(this.FBReader.HyphON, Range, function (HTML) {
                return _this.DrawEnd(HTML);
            });
        };
        ReaderPage.prototype.DrawEnd = function (HTML) {
            this.Element.innerHTML = HTML;
            this.OnDrawDone();
        };
        ReaderPage.prototype.EndPos = function () {
            return null;
        };
        return ReaderPage;
    })();    
    var RenderQueue = (function () {
        function RenderQueue(Pages, StartPos) {
            this.Pages = Pages;
            var _this = this;
            this.Pages[0].DrawInit(StartPos, function () {
                return _this.RenderNext();
            });
        }
        RenderQueue.prototype.RenderNext = function () {
            var _this = this;
            this.Pos++;
            var NextPage = this.Pages[this.Pos];
            if (NextPage) {
                setTimeout(function () {
                    return _this._RenderNext();
                }, 10);
            }
        };
        RenderQueue.prototype._RenderNext = function () {
            var _this = this;
            this.Pages[this.Pos].DrawInit(this.Pages[this.Pos - 1].EndPos(), function () {
                return _this.RenderNext();
            });
        };
        return RenderQueue;
    })();    
    var Reader = (function () {
        function Reader(ArtID, Site, FB3DOM, Bookmarks) {
            this.ArtID = ArtID;
            this.Site = Site;
            this.FB3DOM = FB3DOM;
            this.Bookmarks = Bookmarks;
            // First we start loading data - hopefully it will happend in the background
            this.Init();
            // Basic class init
            this.HyphON = true;
            this.NColumns = 2;
            this.CacheForward = 6;
            this.CacheBackward = 2;
            // Environment research & canvas preparation
            this.PrepareCanvas();
            this.ResetCache();
        }
        Reader.prototype.Init = function () {
            var _this = this;
            this.FB3DOM.Init(this.HyphON, this.ArtID, function () {
                _this.LoadDone();
            });
            this.Bookmarks.Load(this.ArtID, function () {
                _this.LoadDone();
            });
        };
        Reader.prototype.LoadDone = function () {
            if (this.FB3DOM.Ready && this.Bookmarks.Ready) {
                var ReadPos;
                if (this.Bookmarks && this.Bookmarks.CurPos) {
                    ReadPos = this.Bookmarks.CurPos.Fragment.From;
                } else {
                    ReadPos = [
                        0
                    ];
                }
                this.GoTO(ReadPos);
            }
        };
        Reader.prototype.TestDOM = function (HTML) {
            this.Site.getElementById('FB3ReaderColumn0').innerHTML = '<div class="FBReaderAbsDiv">' + HTML + '</div>';
        };
        Reader.prototype.GoTO = function (NewPos) {
            var GotoPage = this.GetCachedPage(NewPos);
            if (GotoPage != undefined) {
                this.GoTOPage(GotoPage);
            } else {
                this.GoToOpenPosition(NewPos);
            }
        };
        Reader.prototype.GoTOPage = function (Page) {
        };
        Reader.prototype.GoToOpenPosition = function (NewPos) {
            var _this = this;
            var FragmentEnd = NewPos[0] + 10;
            if (FragmentEnd > this.FB3DOM.TOC[this.FB3DOM.TOC.length - 1].e) {
                FragmentEnd = this.FB3DOM.TOC[this.FB3DOM.TOC.length - 1].e;
            }
            var Range = {
                From: NewPos,
                To: [
                    FragmentEnd
                ]
            };
            this.FB3DOM.GetHTMLAsync(this.HyphON, Range, function (HTML) {
                return _this.TestDOM(HTML);
            });
        };
        Reader.prototype.TOC = function () {
            return this.FB3DOM.TOC;
        };
        Reader.prototype.ResetCache = function () {
        };
        Reader.prototype.GetCachedPage = function (NewPos) {
            return undefined;
        };
        Reader.prototype.SearchForText = function (Text) {
            return null;
        };
        Reader.prototype.PrepareCanvas = function () {
            var InnerHTML = '<div class="FB3ReaderColumnset' + this.NColumns + '" id="FB3ReaderHostDiv" style="width:100%; overflow:hidden; height:100%">';
            this.Pages = new Array();
            for(var I = 0; I < (this.CacheBackward + this.CacheForward + 1); I++) {
                for(var J = 0; J < this.NColumns; J++) {
                    var NewPage = new ReaderPage(J, this.FB3DOM, this);
                    this.Pages[this.Pages.length] = NewPage;
                    InnerHTML += NewPage.GetInitHTML(I * J);
                }
            }
            InnerHTML += '</div>';
            this.Site.Canvas.innerHTML = InnerHTML;
        };
        return Reader;
    })();
    FB3Reader.Reader = Reader;    
})(FB3Reader || (FB3Reader = {}));
//@ sourceMappingURL=FB3Reader.js.map
