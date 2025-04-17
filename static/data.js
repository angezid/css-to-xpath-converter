
const defaultHtmls = {
    "name":  "Built-in HTMLs",
    "page": {
        "content": "<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\" />\n    <link rel=\"icon\" type=\"image/png\" href=\"static/favicon.png\">\n    <link rel=\"stylesheet\" href=\"static/main.css\">\n    <script src=\"static/main.js\"></script>\n  </head>\n  <body>\n    <header class=\"top-nav\"> </header>\n    <div class=\"search-form\">\n      <form class=\"search\" action=\"../$search.html\" method=\"get\">\n        <input id=\"q\" type=\"text\" required placeholder=\"Search ...\" />\n        <input class=\"submit\" type=\"submit\" />\n      </form>\n    </div>\n    <div id=\"wrapper\" lang=\"en\">\n      <div class=\"nav-wrap\">\n        <nav class=\"sidebar\">\n          <form class=\"nav-filter\">\n            <span class=\"filter-img\"></span>\n            <input id=\"fq\" type=\"text\" placeholder=\". filter ... \" />\n          </form>\n          <h4>Toc header</h4>\n          <div class=\"toc\">\n            <ul>\n              <li><a href=\"url1.html\">Item 1</a></li>\n              <li><a href=\"url2.html\">Item 2</a></li>\n              <li><a href=\"url3.html\">Item 3</a></li>\n              <li><a href=\"url4.html\">Item 4</a></li>\n            </ul>\n          </div>\n        </nav>\n      </div>\n      <div class=\"content-wrap\">\n        <div class=\"content main\">\n          <form class=\"search-bar\"></form>\n          <section title=\"Section one\">\n            <article>\n              <h1>Header</h1>\n              <p class=\"p1\">Paragraph one.</p>\n              <p class=\"p2\">Paragraph two.</p>\n              <p>Test content.</p>\n            </article>\n          </section>\n          <section title=\"Section two\">\n            <div>\n              <label><input type=\"checkbox\" checked value=\"\">checkbox</label>\n              <label><input type=\"radio\" value=\"\" checked> radio 1</label>\n              <label><input type=\"radio\" value=\"\"> radio 2</label>\n            </div>\n          </section>\n        </div>\n        <footer>\n          <span>Footer</span>\n          <a href=\"https://#\">link</a>\n        </footer>\n      </div>\n    </div>\n  </body>\n</html>"
	},
    "table": {
		"content": "<div>\n  <table class=\"t1\">\n    <tbody><tr>\n      <td>1.1</td>\n      <td>1.2</td>\n      <td>1.3</td>\n    </tr>\n    <tr>\n      <td>2.1</td>\n      <td>2.2</td>\n      <td>2.3</td>\n    </tr>\n    <tr>\n      <td>3.1</td>\n      <td>3.2</td>\n      <td>3.3</td>\n    </tr>\n    <tr>\n      <td>4.1</td>\n      <td>4.2</td>\n      <td>4.3</td>\n    </tr>\n  </tbody></table>\n</div>"
	},
	"descriptionList": {
		"content": "<div>\n  <dl>\n    <dt>First definition term</dt>\n      <dd>First definition</dd>\n    <dt>Second definition term</dt>\n      <dd>Second definition</dd>\n    <dt>Third definition term</dt>\n      <dd>Third definition</dd>\n    <dt>Fourth definition term</dt>\n      <dd>Fourth definition</dd>\n    <dt>Fifth definition term</dt>\n      <dd>Fifth definition</dd>\n    <dt>Sixth definition term</dt>\n      <dd>Sixth definition</dd>\n  </dl>\n</div>"
	},
	"unorderedList": {
		"content": "<ul>\n  <li class=\"noted\">Diego</li>\n  <li>Shilpa</li>\n  <li class=\"noted\">Caterina</li>\n  <li>Jayla</li>\n  <li>Tyrone</li>\n  <li>Ricardo</li>\n  <li class=\"noted\">Gila</li>\n  <li>Sienna</li>\n  <li>Titilayo</li>\n  <li class=\"noted\">Lexi</li>\n  <li>Aylin</li>\n  <li>Leo</li>\n  <li>Leyla</li>\n  <li class=\"noted\">Bruce</li>\n  <li>Aisha</li>\n  <li>Veronica</li>\n  <li class=\"noted\">Kyouko</li>\n  <li>Shireen</li>\n  <li>Tanya</li>\n  <li class=\"noted\">Marlene</li>\n</ul>"
	},
	"toc": {
		"content": "<ul>\n  <li>\n    <div class=\"collapsed\"></div>\n    <span>Header</span>\n    <ul style=\"display:none;\">\n      <li><a href=\"#\">Item </a></li>\n      <li><a href=\"#\">Item </a></li>\n      <li><a href=\"#\">Item </a></li>\n      <li>\n        <div class=\"collapsed\"></div>\n        <span>Subheader</span>\n        <ul style=\"display:none;\">\n          <li><a href=\"#\">Item </a></li>\n          <li><a href=\"#\">Item </a></li>\n          <li><a href=\"#\">Item </a></li>\n        </ul>\n      </li>\n    </ul>\n  </li>\n  <li><a href=\"#\">Item </a></li>\n  <li><a href=\"#\">Item </a></li>\n  <li><a href=\"#\">Item </a></li>\n  <li><a href=\"#\">Item </a></li>\n  <li><a href=\"#\">Item </a></li>\n</ul>"
	}
};

const exampleSelectors = [
	["$$Combinators", ""],
	["ul > li", "child"],
	["li !> ul", "parent", "0"],
	["h1 + p", "adjacent following sibling"],
	["div !+ p", "adjacent preceding sibling", "0"],
	["div ^ p", "first child"],
	["div !^ p", "last child", "0"],
	["div ~ p", "following sibling"],
	["div !~ p", "preceding sibling", "0"],
	["p ! div", "ancestors", "0"],

	["$$Class, id", ""],
	["div.content", "contains class"],
	["#wrapper", "id"],

	["$$Class attribute non-standard", "Non-standard XPath behavior", "It deals with individual classes instead of the whole className string"],
	["div[class='content']", "contains class", "", "N"],
	["div[class!='content']", "not contains class", "", "N"],
	["div[class='content' i]", "contains class ignore case", "1 2", "N"],
	["div[class^='cont']", "class starts with", "", "N"],
	["div[class$='tent']", "class ends with", "", "N"],
	["div[class~='content']", "contains class", "", "N"],
	["div[class*='ten']", "contains class containing substring", "", "N"],
	["div[class|='content']", "contains exactly or followed by a hyphen", "", "N"],

	["$$Attributes", ""],
	["section[title='Section one']", "equal"],
	["section[title!='Section one']", "not equals"],
	["section[title^='Sect']", "starts with"],
	["section[title$='two']", "ends with"],
	["section[title*='on on']", "contains within"],
	["*[lang|=EN]", "exactly or followed by a hyphen"],

	["$$Attributes ignore case", ""],
	["section[title='section one' i]", "", "1 2"],
	["section[title^='sect' i]", "", "1 2"],
	["section[title$='TWO' i]", "", "1 2"],
	["section[title~='One' i]", "", "1 2"],
	["section[title*='on On' i]", "", "1 2"],

	["$$Pseudo-classes", ""],
	["div:not(.toc)", ""],
	["div:not(:has(nav))", ""],
	["div:has(h1, h2)", ""],
	["div:has(.main)", ""],
	["a:is([name], [href])", ""],
	[":is(ol, ul) :is(ol, ul) ol", ""],
	["li:after(div)", "", "0"],
	["p:after-sibling(h1)", "", "0"],
	["a:before(h1)", "", "0"],
	["p:before-sibling(p.p2)", "", "0"],
	["div:has-sibling(footer)", "", "0"],
	["form:has-parent(nav)", "", "0"],
	["input:has-ancestor(nav)", "", "0"],
	["p:contains('Test')", "contains text", "0"],
	["p:icontains('content')", "", "0 2"],
	["p:starts-with(Test)", "", "0"],
	["p:istarts-with('TEST')", "", "0 2"],
	["p:ends-with('tent.')", "", "0"],
	["p:iends-with('TENT.')", "", "0 2"],
	["ul>li:first", "the first element", "0"],
	["ul>li:first(2)", "the first n elements", "0"],
	["ul>li:last", "the last element", "0"],
	["ul>li:last(2)", "the last n elements", "0"],
	["li:nth(5)", "element equal to n", "0"],
	["li:eq(4)", "element equal to n", "0"],
	["li:gt(3)", "elements greater than n", "0"],
	["li:lt(4)", "elements lesser than n", "0"],
	["li:skip(4)", "skip elements lesser than n", "0"],
	["li:skip-first", "skips the first element", "0"],
	["li:skip-first(2)", "skips the first n elements", "0"],
	["li:skip-last", "skips the last element", "0"],
	["li:skip-last(2)", "skips the last n elements", "0"],
	["li:limit(5)", "from to n inclusive", "0"],
	["li:range(2, 5)", "from n1 to n2 inclusive", "0"],
	["a:external", ""],
	["*:empty", "empty elements"],
	[":checked", ""],
	[":enabled", ""],
	[":disabled", ""],
	[":target", ""],
	[":text", ""],

	["$$'-child'", ""],
	["li:first-child", ""],
	["li:last-child", ""],
	["p:only-child", ""],

	["$$'nth-child'", ""],
	["li:nth-child(3)", ""],
	["li:nth-child(odd)", ""],
	["li:nth-child(even)", ""],
	["li:nth-child(even of .noted)", ""],
	["li:nth-child(3n+2)", ""],

	["$$'nth-last-child'", ""],
	["li:nth-last-child(3)", ""],
	["li:nth-last-child(odd)", ""],
	["li:nth-last-child(even)", ""],
	["p:nth-last-child(3n+2)", ""],
	["p:nth-last-child(3n+2 of .noted)", ""],
	["p:nth-last-child(-3n+2)", ""],

	["$$'-of-type'", "", "Not works with universal selector '*'"],
	["div p:first-of-type", ""],
	["div>p:last-of-type", ""],
	["div p:only-of-type", ""],

	["$$':nth-of-type'", "", "Not works with universal selector '*'"],
	["li:nth-of-type(3)", ""],
	["li:nth-of-type(odd)", ""],
	["li:nth-of-type(even)", ""],
	["li:nth-of-type(3n+2)", ""],
	["li:nth-of-type(-3n+2)", ""],

	["$$':nth-last-of-type'", "", "Not works with universal selector '*'"],
	["li:nth-last-of-type(3)", ""],
	["li:nth-last-of-type(odd)", ""],
	["li:nth-last-of-type(even)", ""],
	["p:nth-last-of-type(3n+2)", ""],
	["p:nth-last-of-type(-3n+2)", ""],

	["$$Spaces, comments", ""],
	["ul   >   li:not (  .c1  )", ""],
	["li:nth-child  (  -3n  +  4  )   ", ""],
	[`li !> ul:first /*parent*/
!^   li      /*last child*/
!+   li  /*previous siblings*/`, "A comments demo"],

	["$$namespaces", "Not works in browsers", ""],
	["|*", "all elements without a namespace"],
	["*|*", "all elements"],
	["ns|*", "all elements in namespace ns"],
	["ns|p", ""],
	["div ns|p", ""],
	["div |*", ""],
	["div *|*", ""],
	["div ns|*", ""],
	["div ns|p", ""],
	["*:not(ns|p)", ""],
	["a[xlink|href='...']", "attributes with namespace"],
];

const classAttributes = [
	["$$Class attribute", "Standard XPath behavior", "It deals with the whole className string"],
	["div[class='content']", "className is equal"],
	["div[class='content' i]", "className is equal ignore case"],
	["div[class^='cont']", "className starts with"],
	["div[class$='tent']", "className ends with"],
	["div[class~='content']", "contains class; the same as 'div.content'"],
	["div[class*='ten']", "className contains within"],
	["div[class|='content']", "className is equal or followed by a hyphen"],
];


const autocompleteCSS = [
	":after()",
	":after-sibling()",
	":any-link",
	":before()",
	":before-sibling()",
	":checked",
	":contains()",
	":disabled",
	":empty",
	":enabled",
	":ends-with()",
	":eq()",
	":external",
	":first",
	":first()",
	":first-child",
	":first-of-type",
	":gt()",
	":has()",
	":has-ancestor()",
	":has-parent()",
	":has-sibling()",
	":icontains()",
	":iends-with()",
	":is()",
	":istarts-with()",
	":last",
	":last()",
	":last-child",
	":last-of-type",
	":limit()",
	":lt()",
	":matches()",
	":not()",
	":nth()",
	":nth-child()",
	":nth-last-child()",
	":nth-last-of-type()",
	":nth-of-type()",
	":only-child",
	":only-of-type",
	":range()",
	":root",
	":selected",
	":skip()",
	":skip-first",
	":skip-first()",
	":skip-last",
	":skip-last()",
	":starts-with()",
	":target",
	":text",
];

const autocompleteXPath = [
	"ancestor::",
	"ancestor-or-self::",
	"attribute::",
	"child::",
	"descendant::",
	"descendant-or-self::",
	"namespace::",
	"following::",
	"following-sibling::",
	"parent::",
	"preceding::",
	"preceding-sibling::",
	"self::",
	"and",
	"boolean()",
	"ceiling()",
	"concat()",
	"contains()",
	"count()",
	"false()",
	"floor()",
	"id()",
	"lang()",
	"last()",
	"local-name()",
	"mod",
	"name()",
	"namespace-uri()",
	"node()",
	"normalize-space()",
	"not()",
	"or",
	"position()",
	"processing-instruction()",
	"round()",
	"starts-with()",
	"string()",
	"string-length()",
	"substring()",
	"substring-after()",
	"substring-before()",
	"sum()",
	"text()",
	"translate()",
	"true()",
];

const htmlAttributes = [
	"@abbr", "@accept", "@accesskey", "@action", "@actuate", "@align", "@alink", "@allowfullscreen", "@allowpaymentrequest", "@alt", "@arcrole", "@aria-", "@async", "@autocomplete", "@autofocus", "@autoplay", "@axis", "@background", "@bgcolor", "@body", "@border", "@cellpadding", "@cellspacing", "@challenge", "@charset", "@checked", "@cite", "@class", "@clear", "@codetype", "@color", "@cols", "@colspan", "@command", "@compact", "@content", "@contenteditable", "@contextmenu", "@controls", "@coords", "@crossorigin", "@data-", "@datetime", "@declare", "@default", "@defer", "@dir", "@direction", "@dirname", "@disabled", "@download", "@draggable", "@dropzone", "@encoding", "@enctype", "@event", "@face", "@for", "@form", "@formaction", "@formenctype", "@formmethod", "@formnovalidate", "@formtarget", "@frame", "@frameborder", "@headers", "@height", "@hidden", "@high", "@href", "@hreflang", "@icon", "@id", "@integrity", "@ismap", "@keytype", "@kind", "@label", "@lang", "@language", "@link", "@list", "@longdesc", "@loop", "@low", "@manifest", "@marginheight", "@marginwidth", "@max", "@maxlength", "@media", "@mediagroup", "@method", "@min", "@minlength", "@multiple", "@muted", "@name", "@nohref", "@nonce", "@noresize", "@noshade", "@novalidate", "@nowrap", "@open", "@optimum", "@pattern", "@ping", "@placeholder", "@poster", "@preload", "@prompt", "@radiogroup", "@readonly", "@referrerpolicy", "@rel", "@required", "@rev", "@reversed", "@role", "@rows", "@rowspan", "@rules", "@sandbox", "@scheme", "@scope", "@scoped", "@scrolling", "@seamless", "@selected", "@shape", "@show", "@size", "@sizes", "@slot", "@space", "@span", "@spellcheck", "@src", "@srcdoc", "@srclang", "@srcset", "@standalone", "@start", "@step", "@style", "@summary", "@tabindex", "@target", "@text", "@title", "@translate", "@type", "@typemustmatch", "@usemap", "@valign", "@value", "@valuetype", "@version", "@vlink", "@width", "@window", "@wrap",
];

const htmlTags = [
	"abbr", "acronym", "address", "applet", "area", "article", "aside", "audio", "base", "basefont", "bdi", "bdo", "bgsound", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "command", "comment", "content", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "em", "embed", "fencedframe", "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "iframe", "image", "img", "input", "ins", "isindex", "kbd", "keygen", "label", "legend", "li", "link", "listing", "main", "map", "mark", "marquee", "math", "menu", "menuitem", "meta", "meter", "multicol", "nobr", "noembed", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "plaintext", "pre", "progress", "rb", "rp", "rt", "rtc", "ruby", "samp", "script", "search", "section", "select", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "svg", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr", "xmp",
];
 