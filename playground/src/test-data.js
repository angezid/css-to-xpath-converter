const cssSelectors = {
  "CssToXPath": {
    "paths": [
      "CssToXPath.html"
    ],
    "selectors": [
      "*:has-parent(div[id])",
      "*:has-sibling(div[id])",
      "*:nth-child(-n+3 of li.noted)",
      "*:has-sibling(div[id], ul[id])",
      "*:has-ancestor(div[id]):not(div)",
      "  li:nth-child(  -3n  +  4  )   ",
      "*:nth-last-child(-n+3 of li.noted)",
      "a:is([name], [href])",
      "a:not(li.c1 a, p a)",
      "article p:only-of-type",
      "article p:first-of-type",
      "article em:last-of-type",
      "article div:only-of-type",
      "article>div>em:last-of-type",
      "article div[class]:last-of-type",
      "b:not(ul > :nth-child(2n) b)",
      "b:not(ul > li:nth-of-type(2n) b)",
      "b:not(ul > :nth-last-child(2n) b)",
      "b:not(ul > li:nth-last-of-type(2n) b)",
      "body[lang|=EN]",
      ":dir(rtl)",
      "div.content",
      "div>*:only-child",
      "div > span:dir(ltr)",
      "div + p:nth-child(2)",
      "div ~ p:nth-child(2)",
      "div > p:nth-child(2)",
      "div + div > :dir(ltr)",
      "div + p:nth-last-child(1)",
      "div ~ p:nth-last-child(1)",
      "div > p:nth-last-child(1)",
      "div[id]:has-sibling(div:empty)",
      "div ul[id=list] > li:range(2, 5)",
      "div:contains('Test')",
      "div:empty",
      "div:first-child",
      "div:has(h1, h2)",
      "div:has(>ul, >p)",
      "div:has(+div[id])",
      "div:has(h1, :not(h2, p, :empty))",
      "div:has(+ div:has(> p, ~ :empty))",
      "div:has(h1, h2, p, li):not([id^=list])",
      "div:has(+ div:has(> h1, > p, + :empty))",
      "div:has(p):last-child:contains('XPath')",
      "div:has(h1, h2, .nested):not(:has(li))/*excluded .nested*/",
      "div:has-ancestor(main)",
      "div:has-parent(main)",
      "div:last-child",
      "div:not(h1, h2)",
      "div:not(:has(#lists)):not(:has(ul))",
      "div:not(:has-ancestor(#lists), :has(h2), :contains('Content'))",
      "div:starts-with('Test')",
      ":is(ol,ul) :is(ol,ul) ol",
      ":is(p, li):has-ancestor(div, ul[id])",
      ":is(p, h1, li):has-parent(div, ul[id])",
      "li !> ul",
      "li:not(:first)",
      "li:not(:last(4))",
      "li:not(:first(4))",
      "li:not(ul[id] :gt(4))",
      "li:not(ul[id] > :lt(4))",
      "li:not(:nth-child(odd of .noted))",
      "li:not(div:first div > ul :last(3))",
      "li:not(div:first div > ul :first(3))",
      "li:not(:nth-last-child(odd of .noted))",
      "li:not(body div:first div > ul :range(2, 4))",
      "li:nth-child(even of .noted)",
      "li:nth-child(-n+3 of li.noted)",
      "li:nth-child(even of :not(.noted))",
      "li:nth-last-child(even of .noted)",
      "li:nth-last-child(-n+3 of li.noted)",
      "li:nth-last-child(even of :not(.noted))",
      "li:nth-last-child(even of :not(.noted ~ li))",
      "main > div[id=lists]",
      ":not(div + p)",
      ":not(div > p)",
      ":not(div ~ p)",
      ":not(div ^ p)",
      ":not(p ! div)",
      ":not(p !+ div)",
      ":not(p !> div)",
      ":not(p !~ div)",
      ":not(div !^ p)",
      ":not(.p3 span)",
      ":not(p ! div b)",
      ":not(:dir(rtl))",
      ":not(div p span)",
      ":not(div + p span)",
      ":not(div > p span)",
      ":not(div ~ p span)",
      ":not(div ^ p span)",
      ":not(p !> div span)",
      ":not(div !^ p span)",
      ":not(li:range(2, 5))",
      ":not([class] span + b)",
      ":not(div !~ p span > b)",
      ":not(div  p > span, p b)",
      ":not(div > div + p > span)",
      ":not(div ~ div > :dir(ltr))",
      ":not(div > [class] span + b)",
      ":not(:has(div + p:nth-last-child(1)))",
      ":nth-child(even of p)",
      ":nth-child(even of li, p)",
      ":nth-last-child(even of p)",
      ":nth-last-child(even of li, p)",
      ":nth-child(even of :not(.noted ~ li))",
      ":nth-child(even of :not(.noted > span))",
      ":nth-child(even of :not(.noted + li span))",
      ":nth-last-child(even of :not(.noted > span))",
      ":nth-last-child(even of :not(.noted + li span))",
      "p + *",
      "p.p4 ~ *",
      "p.p2 !> *",
      "p.p4 !~ *",
      "p[class=p2]",
      "p[class^=p2]",
      "p[class$=p2]",
      "p[class~=p2]",
      "p[class*=p2]",
      "p[class|=p2]",
      "p.es\\'cap\\'ed",
      "p.es\\{cap\\}ed",
      "p#es\\'cap\\'ed",
      "p#es\\{cap\\}ed",
      "p[id$=cap\\}ed]",
      "p[id~=1escaped]",
      "p[id*=\\'cap\\']",
      "p.\\000031escaped",
      "p#\\000031escaped",
      "p[id|=\\#escaped]",
      "p[class$=cap\\}ed]",
      "p[class~=1escaped]",
      "p[class*=\\'cap\\']",
      "p[id=es\\'cap\\'ed]",
      "p[class|=\\#escaped]",
      "p[class=es\\'cap\\'ed]",
      "p:after(h2)",
      "p:after(ul ul.c1 ul.c2)",
      "p:before(h2)",
      "p:before(ul ul.c1 ul.c2)",
      "p:ends-with('XPath convertor')",
      "p:nth-child(3)",
      "p:nth-child(odd)",
      "p:nth-child(even)",
      "p:nth-last-child(3)",
      "p:nth-last-child(odd)",
      "p:nth-last-child(even)",
      "p:nth-last-of-type(3)",
      "p:nth-last-of-type(odd)",
      "p:nth-last-of-type(even)",
      "p:nth-of-type(3)",
      "p:nth-of-type(odd)",
      "p:nth-of-type(even)",
      ":root",
      "ul",
      "ul[id] ^ li ~ li",
      "ul > li:first + *",
      "ul > li:last !+ *",
      "ul[id] > li:lt(4)",
      "ul[id]>li:skip(4)",
      "ul[id] !^ li !~ li",
      "ul li:nth-child(3)",
      "ul>li[title$='One']",
      "ul[id]>li:skip-last",
      "ul>li[title^='Item']",
      "ul>li[title*='Item']",
      "ul[id]>li:skip-first",
      "ul[id] > li:limit(5)",
      "ul li:nth-child(odd)",
      "ul li:nth-child(n+3)",
      "ul li:nth-child(n+4)",
      "ul li:nth-of-type(3)",
      "ul li:nth-child(even)",
      "ul li:nth-child(3n+2)",
      "ul li:nth-child(-n+4)",
      "ul li:nth-child(5n-2)",
      "ul[id]>li:skip-last(3)",
      "ul li:nth-child(-3n+4)",
      "ul li:nth-of-type(odd)",
      "ul li:nth-of-type(n+3)",
      "ul li:nth-of-type(n+4)",
      "ul[id] > li:not(:gt(4))",
      "ul[id]>li:skip-first(2)",
      "ul li:nth-last-child(3)",
      "ul li:nth-of-type(even)",
      "ul li:nth-of-type(3n+2)",
      "ul li:nth-of-type(3n-2)",
      "ul li:nth-of-type(-n+4)",
      "ul[id='list'] > li:gt(4)",
      "ul[id] > li:not(:nth(3))",
      "ul[id] li:not(:limit(4))",
      "ul li:nth-of-type(-3n+4)",
      "ul[id] > li:not(:skip(4))",
      "ul[id] li:not(:skip-last)",
      "ul li:nth-last-child(odd)",
      "ul li:nth-last-child(n+3)",
      "ul li:nth-last-child(n+4)",
      "ul li:nth-last-of-type(3)",
      "ul[id] li:not(:skip-first)",
      "ul li:nth-last-child(even)",
      "ul li:nth-last-child(3n+2)",
      "ul li:nth-last-child(-n+4)",
      "ul li:nth-last-child(5n-2)",
      "ul li:nth-last-child(-3n+4)",
      "ul li:nth-last-of-type(n+3)",
      "ul li:nth-last-of-type(n+4)",
      "ul>li[title*='em Twenty On']",
      "ul li:nth-last-of-type(3n+2)",
      "ul li:nth-last-of-type(3n-2)",
      "ul li:nth-last-of-type(-n+4)",
      "ul li:nth-last-of-type(-3n+4)",
      "ul[id] > li:not(:skip-last(3))",
      "ul[id] > li:not(:skip-first(2))",
      "ul[id] > li:not(div ul > :last(3))",
      "ul[id] > li:eq(4), ul[id]>li:nth(5)",
      "ul  >  li[  title  =  'item one'  i  ]",
      "ul:first > li:first",
      "ul:first li:first(3)",
      "ul:first>li:not(.c1, .c2, .c6, .c7)",
      "ul:first  >   li:not(  .c1  , .c2,   .c6, .c7   )",
      "ul:last > li:last",
      "ul:last li:last(3)",
      "body[lang|=En i]",
      "div[class='diV' i]",
      "div[class*='iv' i]",
      "div > p:lang(en-us)",
      "div[class!='div' i]",
      "div[class|='last' i]",
      "div + div > :lang(fr)",
      "div [class^='emph' i]",
      "div [class$='size' i]",
      "div[class~='parent' i]",
      "div:icontains('content')",
      "div:istarts-with('TEST')",
      ":lang(en)",
      ":lang('*-*-*')",
      ":lang('*', fr)",
      ":not(:lang(de-latn, 'fr'))",
      ":not(div + div > :lang(fr))",
      "p:iends-with('xpath Convertor')",
      "p:lang('*-fr')",
      "p:lang(fr-latn)",
      "p:lang('*-latn')",
      "p:lang('*-*-fr')",
      "p:lang('fr-*-*')",
      "p:lang('*-1996')",
      "p:lang('fr-*-1996')",
      "p:lang('fr-*-*-1996')",
      "ul>li[title$='one' i]",
      "ul>li[title~='two' i]",
      "ul>li[title^='item' i]",
      "ul>li[title='item one' i]",
      "ul>li[title*='em twenty on' i]"
    ]
  },
  "CssSelector": {
    "paths": [
      "CssSelector.html"
    ],
    "selectors": [
      "*",
      "*:empty",
      "#-a-b-c-",
      "*:last-child",
      "*:only-child",
      "*[class$=it]",
      "*:first-child",
      "*:nth-child(2)",
      "*[class*=heck]",
      "*[class^=check]",
      "*:nth-child(-n+3)",
      "*:nth-child(-n+3 of span.this)",
      "a",
      "a+span",
      "a+ span",
      "a +span",
      "a + span",
      "a + span, div > p",
      "body",
      ".checkit",
      "dd:nth-child(1)>div:nth-child(3)>div:nth-child(1)>a",
      "div p",
      "div a",
      "div>p",
      "div> p",
      "div >p",
      "div p a",
      "div div",
      "div > p",
      "div[id]",
      "div#myDiv",
      "div ~ form",
      "div .ohyeah",
      "div > * > *",
      "div > p.ohyeah",
      "div:has(p)",
      "div:has(> p)",
      "div:has(p + p)",
      "form input",
      "head p",
      ":is(div, section) > h1",
      "#myDiv",
      "#myDiv *",
      "#myDiv>*",
      "#myDiv :nth-last-child(2)",
      ":nth-child(2)",
      ":nth-last-child(2)",
      ".omg.ohyeah",
      "p",
      "p > *",
      "p.ohyeah",
      "p.hiclass,a",
      "p.hiclass, a",
      "p.hiclass ,a",
      "p.hiclass , a",
      "p[class!='hiclass']",
      "p:first-child",
      "p:has(+ p)",
      "p:last-child",
      "p:nth-child(2)",
      "p:only-child",
      "section:has(:not(h1, h2, h3, h4, h5, h6))",
      "section:not(:has(h1, h2, h3, h4, h5, h6))",
      "#someOtherDiv>*",
      "span.this:nth-child(-n+3)",
      "span:is(.this, .that)",
      "span:nth-child(even)",
      "span:nth-child(10n-1) ",
      "span:nth-child(10n+1) ",
      "span:nth-last-child(3)",
      "span:nth-last-child(2)",
      "#theBody #myDiv",
      "#theBody>#myDiv",
      "#theBody #whatwhatwhat",
      "#theBody>#someOtherDiv",
      "#whatwhatwhat #someOtherDiv",
      "*[style*='display: none' i],*[style*='display:none' i]",
      "input[type='text']",
      "input[type='TEXT']"
    ]
  },
  "CssSelector2": {
    "paths": [
      "CssSelector2.html"
    ],
    "selectors": [
      "a[href][lang][class]",
      "div",
      "div p",
      "div > p",
      "div + p",
      "div ~ p",
      "div p a",
      "div, p, a",
      "div #title",
      "div[class]",
      "div.example",
      "div[class*=e]",
      "div[class^=exa]",
      "div[class$=mple]",
      "div[class=example]",
      "div[class|=dialog]",
      "div[class!=made_up]",
      "div[class~=example]",
      "div.example, div.note",
      "div[class^=exa][class$=mple]",
      "div:not(.example)",
      "h1#title",
      "h1#title + div > p",
      "h1[id]:contains(Selectors)",
      ".note",
      "p:contains(selectors)",
      "p:first-child",
      "p:last-child",
      "p:nth-child(n)",
      "p:nth-child(2n)",
      "p:nth-child(odd)",
      "p:nth-child(even)",
      "p:nth-child(2n+1)",
      "p:only-child",
      "#title",
      "ul .tocline2",
      "ul.toc li.tocline2",
      "ul.toc > li.tocline2"
    ]
  },
  "CssW3CSelector": {
    "paths": [
      "CssW3CSelector.html"
    ],
    "selectors": [
      "*.t1",
      "*:root",
      "[hidden]",
      "[type~=odd]",
      ".\\000035cm",
      "[type~=match]",
      ".5cm",
      "address",
      "address.t5.t5",
      "address[title=foo]",
      "address[title~=foo]",
      "address:empty",
      "address:first-of-type",
      "address:last-of-type",
      "address:not(:last-of-type)",
      "address:not(:first-of-type)",
      "#Aone#Atwo,#Aone#Athree,#Atwo#Athree",
      ".bar",
      "blockquote+div~p",
      "blockquote~div+p",
      "blockquote > div p",
      "blockquote + div p",
      "blockquote div > p",
      ".control",
      "div",
      "div.t1 p",
      "div p.test",
      "div.stub p+p",
      "div.stub p~p",
      "div.stub > *",
      "div.stub *:not(.foo)",
      "div.stub *:not(#foo)",
      "div.stub *:not([title*=' on'])",
      "div.stub *:not([title$='tait'])",
      "div.stub *:not([title^='si on'])",
      "div:not(.t1)",
      "dl",
      "dl > *:not(:nth-of-type(3n+1))",
      "dl > *:not(:nth-last-of-type(3n+1))",
      "#foo",
      ".green",
      "li",
      "li,p",
      "li.t2",
      "li#t2",
      "li#t3",
      "line",
      "line:nth-child(3n-1)",
      "line:nth-last-of-type(3n-1)",
      "line:nth-of-type(odd)",
      "main p:only-of-type, main i[name]:only-of-type",
      "ol li:nth-child(2n+0)",
      "ol > li:not(:nth-child(even))",
      "p",
      "p.t1",
      "p.t2",
      "p.t1.t2",
      "p[title]",
      "p[class~=b]",
      "p[lang|=en]",
      "p[title^=foo]",
      "p[title$=bar]",
      "p[title*=bar]",
      "p *:last-child",
      "p *:first-child",
      "p > *:not(:last-child)",
      "p:not(:target)",
      "p:not(:not(p))",
      "p:not(:only-child)",
      "p:not(:nth-of-type(3))",
      "p:not(:nth-last-of-type(3))",
      "p:not(#other).class:not(.fail).test#id#id",
      "p:only-child",
      "#pass#pass",
      ".red",
      ".t1",
      "#t1",
      ".t1 td:last-child",
      ".t1 td:first-child",
      ".t1 td:not(:last-child)",
      ".t1 td:not(:first-child)",
      ".t1 *:not(address:only-of-type)",
      "table.t1 td",
      "table.t1 td,table.t2 td",
      "table.t2 td:nth-child(3n+1)",
      "table.t1 tr:nth-child(-1n+4)",
      "table.t2 td:not(:nth-child(3n+1))",
      "table.t1 tr:not(:nth-child(-1n+4))",
      "#test",
      "#test1",
      "#test1:empty",
      "#test2",
      "#test2:empty",
      ".text",
      "#two:first-child",
      "ul,p",
      "ul li:nth-child(2n+1)",
      "ul > li:not(:nth-child(odd))",
      ".warning",
      ".white",
      "address[lang=fi]"
    ]
  },
  "nth-child": {
    "paths": [
      "nth.html"
    ],
    "selectors": [
      "p[class]:nth-child(3n)",
      "p[class]:nth-child(5n)",
      "p[class]:nth-child(n+1)",
      "p[class]:nth-child(n+2)",
      "p[class]:nth-child(n-3)",
      "p[class]:nth-child(n-4)",
      "p[class]:nth-child(odd)",
      "p[class]:nth-child(1n+5)",
      "p[class]:nth-child(1n-0)",
      "p[class]:nth-child(1n-2)",
      "p[class]:nth-child(2n-0)",
      "p[class]:nth-child(2n-1)",
      "p[class]:nth-child(2n-2)",
      "p[class]:nth-child(3n+5)",
      "p[class]:nth-child(3n-2)",
      "p[class]:nth-child(3n-3)",
      "p[class]:nth-child(4n+4)",
      "p[class]:nth-child(5n+2)",
      "p[class]:nth-child(-n+4)",
      "p[class]:nth-child(-0n+2)",
      "p[class]:nth-child(-0n+4)",
      "p[class]:nth-child(-1n+2)",
      "p[class]:nth-child(-1n+3)",
      "p[class]:nth-child(-2n+2)",
      "p[class]:nth-child(-2n+5)",
      "p[class]:nth-child(-3n+2)",
      "p[class]:nth-child(-3n+3)",
      "p[class]:nth-child(-3n+4)",
      "p[class]:nth-child(-4n+1)",
      "p[class]:nth-child(-4n+2)",
      "p[class]:nth-child(-5n+5)",
      "p:nth-child(4)",
      "p:nth-child(2n)",
      "p:nth-child(n+0)",
      "p:nth-child(n+5)",
      "p:nth-child(n-2)",
      "p:nth-child(n-3)",
      "p:nth-child(0n+1)",
      "p:nth-child(1n+2)",
      "p:nth-child(1n-3)",
      "p:nth-child(2n-3)",
      "p:nth-child(2n-4)",
      "p:nth-child(2n-5)",
      "p:nth-child(3n-2)",
      "p:nth-child(4n+0)",
      "p:nth-child(4n-4)",
      "p:nth-child(5n+0)",
      "p:nth-child(5n+2)",
      "p:nth-child(even)",
      "p:nth-child(-n+2)",
      "p:nth-child(-n+3)",
      "p:nth-child(-0n+1)",
      "p:nth-child(-0n+2)",
      "p:nth-child(-2n+1)",
      "p:nth-child(-2n+4)",
      "p:nth-child(-3n+1)",
      "p:nth-child(-3n+2)",
      "p:nth-child(-3n+5)",
      "p:nth-child(-4n+5)",
      "p:nth-child(-5n+4)"
    ]
  },
  "nth-child-of-selector": {
    "paths": [
      "nth-child-of-selector.html"
    ],
    "selectors": [
      "li.c1:nth-child(3)",
      "li.c1:nth-child(3n+2)",
      "li:not(:nth-child(2n+3 of li))",
      "li:not(:nth-child(-1n+4 of .c1))",
      "li:not(:nth-child(-2n+3 of .c1))",
      "li:not(:nth-child(0n+1 of li, p))",
      "li:not(:nth-child(1n+3 of li, p))",
      "li:not(:nth-child(2n-2 of li.c2))",
      "li:not(:nth-child(3n-3 of li, p))",
      "li:not(:nth-child(3n-3 of li.c2))",
      "li:not(:nth-child(4n+4 of li, p))",
      "li:not(:nth-child(5n-4 of li, p))",
      "li:not(:nth-child(-0n+3 of p.c2))",
      "li:not(:nth-child(1n+3 of .c2, .c1))",
      "li:not(:nth-child(-1n+2 of li.c1, p.c1))",
      "li:nth-child(2 of .c1)",
      "li:nth-child(n-5 of li)",
      "li:nth-child(1n-4 of li)",
      "li:nth-child(4n+1 of li)",
      "li:nth-child(4n-4 of li)",
      "li:nth-child(5n-1 of li)",
      "li:nth-child(n-5 of .c1)",
      "li:nth-child(2n-0 of .c1)",
      "li:nth-child(3n+4 of .c1)",
      "li:nth-child(4n+0 of .c1)",
      "li:nth-child(5n-5 of .c1)",
      "li:nth-child(-2n+2 of .c1)",
      "li:nth-child(-5n+2 of .c1)",
      "li:nth-child(1n+0 of li.c2)",
      "li:nth-child(2n+3 of li.c2)",
      "li:nth-child(4n-0 of li.c2)",
      "li:nth-child(4n-1 of li.c2)",
      ":not(:nth-child(4 of li, p))",
      ":not(:nth-child(4n+3 of .c1))",
      ":not(:nth-child(-0n+4 of .c1))",
      ":not(:nth-child(3 of .c2, .c1))",
      ":not(:nth-child(4n+0 of li.c2))",
      ":not(:nth-child(4n-2 of li.c2))",
      ":not(:nth-child(even of li, p))",
      ":nth-child(n-4 of .c1)",
      ":nth-child(2n-0 of .c1)",
      ":nth-child(5n+0 of .c1)",
      ":nth-child(5n-0 of .c1)",
      ":nth-child(n+5 of li, p)",
      ":nth-child(1 of .c2, .c1)",
      ":nth-child(4n+4 of li, p)",
      ":nth-child(4n+5 of li, p)",
      ":nth-child(-3n+1 of p.c2)",
      ":nth-child(-3n+2 of p.c2)",
      ":nth-child(-5n+2 of p.c2)",
      ":nth-child(1n-5 of .c2, .c1)",
      ":nth-child(-0n+4 of li.c1, p.c1)",
      ":nth-child(-5n+2 of li.c1, p.c1)",
      "p.c1:nth-child(2)",
      "p.c1:nth-child(-1n+1)",
      "p:not(:nth-child(4n of li, p))",
      "p:not(:nth-child(n+2 of li.c2))",
      "p:not(:nth-child(4n+5 of .c2, .c1))",
      "p:not(:nth-child(-0n+2 of li.c1, p.c1))",
      "p:not(:nth-child(-5n+1 of li.c1, p.c1))"
    ]
  },
  "nth-last-child": {
    "paths": [
      "nth.html"
    ],
    "selectors": [
      "p[class]:nth-last-child(3n)",
      "p[class]:nth-last-child(5n)",
      "p[class]:nth-last-child(n+1)",
      "p[class]:nth-last-child(n+2)",
      "p[class]:nth-last-child(n-3)",
      "p[class]:nth-last-child(n-4)",
      "p[class]:nth-last-child(odd)",
      "p[class]:nth-last-child(1n+5)",
      "p[class]:nth-last-child(1n-0)",
      "p[class]:nth-last-child(1n-2)",
      "p[class]:nth-last-child(2n-0)",
      "p[class]:nth-last-child(2n-1)",
      "p[class]:nth-last-child(2n-2)",
      "p[class]:nth-last-child(3n+5)",
      "p[class]:nth-last-child(3n-2)",
      "p[class]:nth-last-child(3n-3)",
      "p[class]:nth-last-child(4n+4)",
      "p[class]:nth-last-child(5n+2)",
      "p[class]:nth-last-child(-n+4)",
      "p[class]:nth-last-child(-0n+2)",
      "p[class]:nth-last-child(-0n+4)",
      "p[class]:nth-last-child(-1n+2)",
      "p[class]:nth-last-child(-1n+3)",
      "p[class]:nth-last-child(-2n+2)",
      "p[class]:nth-last-child(-2n+5)",
      "p[class]:nth-last-child(-3n+2)",
      "p[class]:nth-last-child(-3n+3)",
      "p[class]:nth-last-child(-3n+4)",
      "p[class]:nth-last-child(-4n+1)",
      "p[class]:nth-last-child(-4n+2)",
      "p[class]:nth-last-child(-5n+5)",
      "p:nth-last-child(4)",
      "p:nth-last-child(2n)",
      "p:nth-last-child(n+0)",
      "p:nth-last-child(n+5)",
      "p:nth-last-child(n-2)",
      "p:nth-last-child(n-3)",
      "p:nth-last-child(0n+1)",
      "p:nth-last-child(1n+2)",
      "p:nth-last-child(1n-3)",
      "p:nth-last-child(2n-3)",
      "p:nth-last-child(2n-4)",
      "p:nth-last-child(2n-5)",
      "p:nth-last-child(3n-2)",
      "p:nth-last-child(4n+0)",
      "p:nth-last-child(4n-4)",
      "p:nth-last-child(5n+0)",
      "p:nth-last-child(5n+2)",
      "p:nth-last-child(even)",
      "p:nth-last-child(-n+2)",
      "p:nth-last-child(-n+3)",
      "p:nth-last-child(-0n+1)",
      "p:nth-last-child(-0n+2)",
      "p:nth-last-child(-2n+1)",
      "p:nth-last-child(-2n+4)",
      "p:nth-last-child(-3n+1)",
      "p:nth-last-child(-3n+2)",
      "p:nth-last-child(-3n+5)",
      "p:nth-last-child(-4n+5)",
      "p:nth-last-child(-5n+4)"
    ]
  },
  "nth-last-child-of-selector": {
    "paths": [
      "nth-child-of-selector.html"
    ],
    "selectors": [
      "li.c1:nth-last-child(1n-5)",
      "li.c1:nth-last-child(4n-4)",
      "li:not(:nth-child(2n-2 of li))",
      "li:not(:nth-child(-4n+1 of .c1))",
      "li:not(:nth-child(2n+1 of li.c2))",
      "li:not(:nth-child(3n+4 of li.c2))",
      "li:not(:nth-child(4n+4 of li, p))",
      "li:not(:nth-last-child(4n of li))",
      "li:not(:nth-child(4n-5 of .c2, .c1))",
      "li:not(:nth-last-child(3n-3 of .c1))",
      "li:not(:nth-last-child(even of .c1))",
      "li:not(:nth-last-child(-n+1 of .c1))",
      "li:not(:nth-last-child(-n+4 of .c1))",
      "li:not(:nth-last-child(-5n+3 of p.c2))",
      "li:not(:nth-last-child(2n+4 of .c2, .c1))",
      "li:nth-last-child(4 of .c1)",
      "li:nth-last-child(3n-5 of li)",
      "li:nth-last-child(4n+4 of li)",
      "li:nth-last-child(1n-5 of .c1)",
      "li:nth-last-child(4n-5 of .c1)",
      "li:nth-last-child(-3n+1 of .c1)",
      "li:nth-last-child(3n+3 of li.c2)",
      "li:nth-last-child(5n-2 of li.c2)",
      ":not(:nth-child(1n+3 of .c1))",
      ":not(:nth-child(-n+1 of p.c2))",
      ":not(:nth-child(-n+3 of p.c2))",
      ":not(:nth-child(2n-4 of li.c2))",
      ":not(:nth-child(5n+2 of li.c2))",
      ":not(:nth-last-child(5 of .c1))",
      ":not(:nth-last-child(4n+5 of li))",
      ":not(:nth-last-child(n+4 of .c1))",
      ":not(:nth-last-child(-n+3 of .c1))",
      ":not(:nth-last-child(-n+4 of .c1))",
      ":not(:nth-last-child(3n+3 of li, p))",
      ":not(:nth-last-child(2n-4 of .c2, .c1))",
      ":not(:nth-last-child(-1n+2 of li.c1, p.c1))",
      ":nth-last-child(3 of .c1)",
      ":nth-last-child(3n-2 of .c1)",
      ":nth-last-child(3n-3 of .c1)",
      ":nth-last-child(5n-5 of .c1)",
      ":nth-last-child(4n+5 of li, p)",
      ":nth-last-child(n-3 of .c2, .c1)",
      ":nth-last-child(3n-1 of .c2, .c1)",
      ":nth-last-child(5n+1 of .c2, .c1)",
      ":nth-last-child(5n+4 of .c2, .c1)",
      ":nth-last-child(-0n+1 of :not(.c1))",
      ":nth-last-child(-0n+5 of li.c1, p.c1)",
      ":nth-last-child(-4n+3 of li.c1, p.c1)",
      "p.c1:nth-last-child(-n+1)",
      "p.c1:nth-last-child(-5n+5)",
      "p:not(:nth-child(3n of .c1))",
      "p:not(:nth-child(1 of li.c2))",
      "p:not(:nth-child(3n+0 of li))",
      "p:not(:nth-child(4n+1 of li))",
      "p:not(:nth-child(n+5 of .c1))",
      "p:not(:nth-child(3n-1 of .c2, .c1))",
      "p:not(:nth-child(5n+4 of .c2, .c1))",
      "p:not(:nth-last-child(4n+3 of .c1))",
      "p:not(:nth-last-child(-5n+4 of .c1))",
      "p:not(:nth-last-child(-2n+3 of li.c1, p.c1))"
    ]
  },
  "nth-of-type": {
    "paths": [
      "nth.html"
    ],
    "selectors": [
      "p[class]:nth-of-type(2)",
      "p[class]:nth-of-type(n)",
      "p[class]:nth-of-type(1n)",
      "p[class]:nth-of-type(n+5)",
      "p[class]:nth-of-type(n-3)",
      "p[class]:nth-of-type(odd)",
      "p[class]:nth-of-type(0n+1)",
      "p[class]:nth-of-type(0n+5)",
      "p[class]:nth-of-type(1n-0)",
      "p[class]:nth-of-type(1n-5)",
      "p[class]:nth-of-type(2n+5)",
      "p[class]:nth-of-type(2n-3)",
      "p[class]:nth-of-type(2n-5)",
      "p[class]:nth-of-type(3n+1)",
      "p[class]:nth-of-type(3n-2)",
      "p[class]:nth-of-type(3n-3)",
      "p[class]:nth-of-type(3n-4)",
      "p[class]:nth-of-type(3n-5)",
      "p[class]:nth-of-type(4n+3)",
      "p[class]:nth-of-type(4n-1)",
      "p[class]:nth-of-type(4n-2)",
      "p[class]:nth-of-type(4n-3)",
      "p[class]:nth-of-type(4n-5)",
      "p[class]:nth-of-type(5n+3)",
      "p[class]:nth-of-type(5n-3)",
      "p[class]:nth-of-type(5n-5)",
      "p[class]:nth-of-type(-n+1)",
      "p[class]:nth-of-type(-n+2)",
      "p[class]:nth-of-type(-1n+2)",
      "p[class]:nth-of-type(-1n+5)",
      "p[class]:nth-of-type(-3n+4)",
      "p[class]:nth-of-type(-4n+4)",
      "p[class]:nth-of-type(-5n+1)",
      "p:nth-of-type(3)",
      "p:nth-of-type(4)",
      "p:nth-of-type(5)",
      "p:nth-of-type(n+0)",
      "p:nth-of-type(n+3)",
      "p:nth-of-type(n+4)",
      "p:nth-of-type(0n+2)",
      "p:nth-of-type(1n+5)",
      "p:nth-of-type(1n-0)",
      "p:nth-of-type(1n-1)",
      "p:nth-of-type(2n+0)",
      "p:nth-of-type(2n+1)",
      "p:nth-of-type(2n-1)",
      "p:nth-of-type(2n-4)",
      "p:nth-of-type(3n+2)",
      "p:nth-of-type(3n-2)",
      "p:nth-of-type(4n+0)",
      "p:nth-of-type(4n-3)",
      "p:nth-of-type(5n+2)",
      "p:nth-of-type(5n-0)",
      "p:nth-of-type(-n+2)",
      "p:nth-of-type(-0n+1)",
      "p:nth-of-type(-0n+3)",
      "p:nth-of-type(-1n+1)",
      "p:nth-of-type(-2n+1)",
      "p:nth-of-type(-2n+4)",
      "p:nth-of-type(-4n+3)"
    ]
  },
  "nth-last-of-type": {
    "paths": [
      "nth.html"
    ],
    "selectors": [
      "p[class]:nth-last-of-type(2)",
      "p[class]:nth-last-of-type(n)",
      "p[class]:nth-last-of-type(1n)",
      "p[class]:nth-last-of-type(n+5)",
      "p[class]:nth-last-of-type(n-3)",
      "p[class]:nth-last-of-type(odd)",
      "p[class]:nth-last-of-type(0n+1)",
      "p[class]:nth-last-of-type(0n+5)",
      "p[class]:nth-last-of-type(1n-0)",
      "p[class]:nth-last-of-type(1n-5)",
      "p[class]:nth-last-of-type(2n+5)",
      "p[class]:nth-last-of-type(2n-3)",
      "p[class]:nth-last-of-type(2n-5)",
      "p[class]:nth-last-of-type(3n+1)",
      "p[class]:nth-last-of-type(3n-2)",
      "p[class]:nth-last-of-type(3n-3)",
      "p[class]:nth-last-of-type(3n-4)",
      "p[class]:nth-last-of-type(3n-5)",
      "p[class]:nth-last-of-type(4n+3)",
      "p[class]:nth-last-of-type(4n-1)",
      "p[class]:nth-last-of-type(4n-2)",
      "p[class]:nth-last-of-type(4n-3)",
      "p[class]:nth-last-of-type(4n-5)",
      "p[class]:nth-last-of-type(5n+3)",
      "p[class]:nth-last-of-type(5n-3)",
      "p[class]:nth-last-of-type(5n-5)",
      "p[class]:nth-last-of-type(-n+1)",
      "p[class]:nth-last-of-type(-n+2)",
      "p[class]:nth-last-of-type(-1n+2)",
      "p[class]:nth-last-of-type(-1n+5)",
      "p[class]:nth-last-of-type(-3n+4)",
      "p[class]:nth-last-of-type(-4n+4)",
      "p[class]:nth-last-of-type(-5n+1)",
      "p:nth-last-of-type(3)",
      "p:nth-last-of-type(4)",
      "p:nth-last-of-type(5)",
      "p:nth-last-of-type(n+0)",
      "p:nth-last-of-type(n+3)",
      "p:nth-last-of-type(n+4)",
      "p:nth-last-of-type(0n+2)",
      "p:nth-last-of-type(1n+5)",
      "p:nth-last-of-type(1n-0)",
      "p:nth-last-of-type(1n-1)",
      "p:nth-last-of-type(2n+0)",
      "p:nth-last-of-type(2n+1)",
      "p:nth-last-of-type(2n-1)",
      "p:nth-last-of-type(2n-4)",
      "p:nth-last-of-type(3n+2)",
      "p:nth-last-of-type(3n-2)",
      "p:nth-last-of-type(4n+0)",
      "p:nth-last-of-type(4n-3)",
      "p:nth-last-of-type(5n+2)",
      "p:nth-last-of-type(5n-0)",
      "p:nth-last-of-type(-n+2)",
      "p:nth-last-of-type(-0n+1)",
      "p:nth-last-of-type(-0n+3)",
      "p:nth-last-of-type(-1n+1)",
      "p:nth-last-of-type(-2n+1)",
      "p:nth-last-of-type(-2n+4)",
      "p:nth-last-of-type(-4n+3)"
    ]
  },
  "not-nth-child": {
    "paths": [
      "not-nth.html"
    ],
    "selectors": [
      "p[class]:not(:nth-child(2))",
      "p[class]:not(:nth-child(5))",
      "p[class]:not(:nth-child(3n))",
      "p[class]:not(:nth-child(odd))",
      "p[class]:not(:nth-child(-4n))",
      "p[class]:not(:nth-child(0n-1))",
      "p[class]:not(:nth-child(0n-2))",
      "p[class]:not(:nth-child(0n-3))",
      "p[class]:not(:nth-child(1n+5))",
      "p[class]:not(:nth-child(2n+3))",
      "p[class]:not(:nth-child(2n+4))",
      "p[class]:not(:nth-child(4n+1))",
      "p[class]:not(:nth-child(4n-3))",
      "p[class]:not(:nth-child(5n+1))",
      "p[class]:not(:nth-child(5n-0))",
      "p[class]:not(:nth-child(-n+2))",
      "p[class]:not(:nth-child(-n+4))",
      "p[class]:not(:nth-child(-0n+1))",
      "p[class]:not(:nth-child(-0n-3))",
      "p[class]:not(:nth-child(-0n-5))",
      "p[class]:not(:nth-child(-1n+0))",
      "p[class]:not(:nth-child(-1n+2))",
      "p[class]:not(:nth-child(-1n+3))",
      "p[class]:not(:nth-child(-1n+4))",
      "p[class]:not(:nth-child(-2n+0))",
      "p[class]:not(:nth-child(-2n-5))",
      "p[class]:not(:nth-child(-3n+4))",
      "p[class]:not(:nth-child(-3n-1))",
      "p[class]:not(:nth-child(-4n-1))",
      "p[class]:not(:nth-child(-5n+2))",
      "p[class]:not(:nth-child(-5n-5))",
      "p:not(:nth-child(4))",
      "p:not(:nth-child(-0n))",
      "p:not(:nth-child(0n-0))",
      "p:not(:nth-child(0n-4))",
      "p:not(:nth-child(0n-5))",
      "p:not(:nth-child(1n+3))",
      "p:not(:nth-child(2n-2))",
      "p:not(:nth-child(3n-1))",
      "p:not(:nth-child(4n+2))",
      "p:not(:nth-child(4n-4))",
      "p:not(:nth-child(5n-0))",
      "p:not(:nth-child(-n+1))",
      "p:not(:nth-child(-n-0))",
      "p:not(:nth-child(-0n+0))",
      "p:not(:nth-child(-0n+5))",
      "p:not(:nth-child(-1n+0))",
      "p:not(:nth-child(-1n+2))",
      "p:not(:nth-child(-1n+5))",
      "p:not(:nth-child(-1n-2))",
      "p:not(:nth-child(-1n-4))",
      "p:not(:nth-child(-2n+2))",
      "p:not(:nth-child(-2n+5))",
      "p:not(:nth-child(-3n+0))",
      "p:not(:nth-child(-3n+3))",
      "p:not(:nth-child(-3n+4))",
      "p:not(:nth-child(-4n+3))",
      "p:not(:nth-child(-5n+3))",
      "p:not(:nth-child(-5n-1))",
      "p:not(:nth-child(-5n-3))"
    ]
  },
  "not-nth-last-child": {
    "paths": [
      "not-nth.html"
    ],
    "selectors": [
      "p[class]:not(:nth-last-child(2))",
      "p[class]:not(:nth-last-child(5))",
      "p[class]:not(:nth-last-child(3n))",
      "p[class]:not(:nth-last-child(odd))",
      "p[class]:not(:nth-last-child(-4n))",
      "p[class]:not(:nth-last-child(0n-1))",
      "p[class]:not(:nth-last-child(0n-2))",
      "p[class]:not(:nth-last-child(0n-3))",
      "p[class]:not(:nth-last-child(1n+5))",
      "p[class]:not(:nth-last-child(2n+3))",
      "p[class]:not(:nth-last-child(2n+4))",
      "p[class]:not(:nth-last-child(4n+1))",
      "p[class]:not(:nth-last-child(4n-3))",
      "p[class]:not(:nth-last-child(5n+1))",
      "p[class]:not(:nth-last-child(5n-0))",
      "p[class]:not(:nth-last-child(-n+2))",
      "p[class]:not(:nth-last-child(-n+4))",
      "p[class]:not(:nth-last-child(-0n+1))",
      "p[class]:not(:nth-last-child(-0n-3))",
      "p[class]:not(:nth-last-child(-0n-5))",
      "p[class]:not(:nth-last-child(-1n+0))",
      "p[class]:not(:nth-last-child(-1n+2))",
      "p[class]:not(:nth-last-child(-1n+3))",
      "p[class]:not(:nth-last-child(-1n+4))",
      "p[class]:not(:nth-last-child(-2n+0))",
      "p[class]:not(:nth-last-child(-2n-5))",
      "p[class]:not(:nth-last-child(-3n+4))",
      "p[class]:not(:nth-last-child(-3n-1))",
      "p[class]:not(:nth-last-child(-4n-1))",
      "p[class]:not(:nth-last-child(-5n+2))",
      "p[class]:not(:nth-last-child(-5n-5))",
      "p:not(:nth-last-child(4))",
      "p:not(:nth-last-child(-0n))",
      "p:not(:nth-last-child(0n-0))",
      "p:not(:nth-last-child(0n-4))",
      "p:not(:nth-last-child(0n-5))",
      "p:not(:nth-last-child(1n+3))",
      "p:not(:nth-last-child(2n-2))",
      "p:not(:nth-last-child(3n-1))",
      "p:not(:nth-last-child(4n+2))",
      "p:not(:nth-last-child(4n-4))",
      "p:not(:nth-last-child(5n-0))",
      "p:not(:nth-last-child(-n+1))",
      "p:not(:nth-last-child(-n-0))",
      "p:not(:nth-last-child(-0n+0))",
      "p:not(:nth-last-child(-0n+5))",
      "p:not(:nth-last-child(-1n+0))",
      "p:not(:nth-last-child(-1n+2))",
      "p:not(:nth-last-child(-1n+5))",
      "p:not(:nth-last-child(-1n-2))",
      "p:not(:nth-last-child(-1n-4))",
      "p:not(:nth-last-child(-2n+2))",
      "p:not(:nth-last-child(-2n+5))",
      "p:not(:nth-last-child(-3n+0))",
      "p:not(:nth-last-child(-3n+3))",
      "p:not(:nth-last-child(-3n+4))",
      "p:not(:nth-last-child(-4n+3))",
      "p:not(:nth-last-child(-5n+3))",
      "p:not(:nth-last-child(-5n-1))",
      "p:not(:nth-last-child(-5n-3))"
    ]
  },
  "not-nth-of-type": {
    "paths": [
      "not-nth.html"
    ],
    "selectors": [
      "p[class]:not(:nth-of-type(2))",
      "p[class]:not(:nth-of-type(5))",
      "p[class]:not(:nth-of-type(3n))",
      "p[class]:not(:nth-of-type(odd))",
      "p[class]:not(:nth-of-type(-4n))",
      "p[class]:not(:nth-of-type(0n-1))",
      "p[class]:not(:nth-of-type(0n-2))",
      "p[class]:not(:nth-of-type(0n-3))",
      "p[class]:not(:nth-of-type(1n+5))",
      "p[class]:not(:nth-of-type(2n+3))",
      "p[class]:not(:nth-of-type(2n+4))",
      "p[class]:not(:nth-of-type(4n+1))",
      "p[class]:not(:nth-of-type(4n-3))",
      "p[class]:not(:nth-of-type(5n+1))",
      "p[class]:not(:nth-of-type(5n-0))",
      "p[class]:not(:nth-of-type(-n+2))",
      "p[class]:not(:nth-of-type(-n+4))",
      "p[class]:not(:nth-of-type(-0n+1))",
      "p[class]:not(:nth-of-type(-0n-3))",
      "p[class]:not(:nth-of-type(-0n-5))",
      "p[class]:not(:nth-of-type(-1n+0))",
      "p[class]:not(:nth-of-type(-1n+2))",
      "p[class]:not(:nth-of-type(-1n+3))",
      "p[class]:not(:nth-of-type(-1n+4))",
      "p[class]:not(:nth-of-type(-2n+0))",
      "p[class]:not(:nth-of-type(-2n-5))",
      "p[class]:not(:nth-of-type(-3n+4))",
      "p[class]:not(:nth-of-type(-3n-1))",
      "p[class]:not(:nth-of-type(-4n-1))",
      "p[class]:not(:nth-of-type(-5n+2))",
      "p[class]:not(:nth-of-type(-5n-5))",
      "p:not(:nth-of-type(4))",
      "p:not(:nth-of-type(-0n))",
      "p:not(:nth-of-type(0n-0))",
      "p:not(:nth-of-type(0n-4))",
      "p:not(:nth-of-type(0n-5))",
      "p:not(:nth-of-type(1n+3))",
      "p:not(:nth-of-type(2n-2))",
      "p:not(:nth-of-type(3n-1))",
      "p:not(:nth-of-type(4n+2))",
      "p:not(:nth-of-type(4n-4))",
      "p:not(:nth-of-type(5n-0))",
      "p:not(:nth-of-type(-n+1))",
      "p:not(:nth-of-type(-n-0))",
      "p:not(:nth-of-type(-0n+0))",
      "p:not(:nth-of-type(-0n+5))",
      "p:not(:nth-of-type(-1n+0))",
      "p:not(:nth-of-type(-1n+2))",
      "p:not(:nth-of-type(-1n+5))",
      "p:not(:nth-of-type(-1n-2))",
      "p:not(:nth-of-type(-1n-4))",
      "p:not(:nth-of-type(-2n+2))",
      "p:not(:nth-of-type(-2n+5))",
      "p:not(:nth-of-type(-3n+0))",
      "p:not(:nth-of-type(-3n+3))",
      "p:not(:nth-of-type(-3n+4))",
      "p:not(:nth-of-type(-4n+3))",
      "p:not(:nth-of-type(-5n+3))",
      "p:not(:nth-of-type(-5n-1))",
      "p:not(:nth-of-type(-5n-3))"
    ]
  },
  "not-nth-last-of-type": {
    "paths": [
      "not-nth.html"
    ],
    "selectors": [
      "p[class]:not(:nth-last-of-type(2))",
      "p[class]:not(:nth-last-of-type(5))",
      "p[class]:not(:nth-last-of-type(3n))",
      "p[class]:not(:nth-last-of-type(odd))",
      "p[class]:not(:nth-last-of-type(-4n))",
      "p[class]:not(:nth-last-of-type(0n-1))",
      "p[class]:not(:nth-last-of-type(0n-2))",
      "p[class]:not(:nth-last-of-type(0n-3))",
      "p[class]:not(:nth-last-of-type(1n+5))",
      "p[class]:not(:nth-last-of-type(2n+3))",
      "p[class]:not(:nth-last-of-type(2n+4))",
      "p[class]:not(:nth-last-of-type(4n+1))",
      "p[class]:not(:nth-last-of-type(4n-3))",
      "p[class]:not(:nth-last-of-type(5n+1))",
      "p[class]:not(:nth-last-of-type(5n-0))",
      "p[class]:not(:nth-last-of-type(-n+2))",
      "p[class]:not(:nth-last-of-type(-n+4))",
      "p[class]:not(:nth-last-of-type(-0n+1))",
      "p[class]:not(:nth-last-of-type(-0n-3))",
      "p[class]:not(:nth-last-of-type(-0n-5))",
      "p[class]:not(:nth-last-of-type(-1n+0))",
      "p[class]:not(:nth-last-of-type(-1n+2))",
      "p[class]:not(:nth-last-of-type(-1n+3))",
      "p[class]:not(:nth-last-of-type(-1n+4))",
      "p[class]:not(:nth-last-of-type(-2n+0))",
      "p[class]:not(:nth-last-of-type(-2n-5))",
      "p[class]:not(:nth-last-of-type(-3n+4))",
      "p[class]:not(:nth-last-of-type(-3n-1))",
      "p[class]:not(:nth-last-of-type(-4n-1))",
      "p[class]:not(:nth-last-of-type(-5n+2))",
      "p[class]:not(:nth-last-of-type(-5n-5))",
      "p:not(:nth-last-of-type(4))",
      "p:not(:nth-last-of-type(-0n))",
      "p:not(:nth-last-of-type(0n-0))",
      "p:not(:nth-last-of-type(0n-4))",
      "p:not(:nth-last-of-type(0n-5))",
      "p:not(:nth-last-of-type(1n+3))",
      "p:not(:nth-last-of-type(2n-2))",
      "p:not(:nth-last-of-type(3n-1))",
      "p:not(:nth-last-of-type(4n+2))",
      "p:not(:nth-last-of-type(4n-4))",
      "p:not(:nth-last-of-type(5n-0))",
      "p:not(:nth-last-of-type(-n+1))",
      "p:not(:nth-last-of-type(-n-0))",
      "p:not(:nth-last-of-type(-0n+0))",
      "p:not(:nth-last-of-type(-0n+5))",
      "p:not(:nth-last-of-type(-1n+0))",
      "p:not(:nth-last-of-type(-1n+2))",
      "p:not(:nth-last-of-type(-1n+5))",
      "p:not(:nth-last-of-type(-1n-2))",
      "p:not(:nth-last-of-type(-1n-4))",
      "p:not(:nth-last-of-type(-2n+2))",
      "p:not(:nth-last-of-type(-2n+5))",
      "p:not(:nth-last-of-type(-3n+0))",
      "p:not(:nth-last-of-type(-3n+3))",
      "p:not(:nth-last-of-type(-3n+4))",
      "p:not(:nth-last-of-type(-4n+3))",
      "p:not(:nth-last-of-type(-5n+3))",
      "p:not(:nth-last-of-type(-5n-1))",
      "p:not(:nth-last-of-type(-5n-3))"
    ]
  },
};

const htmls = {
"CssSelector": `
<!DOCTYPE html>
<html lang='en'>
<head>
<meta charset='utf-8'>
<title>Test</title>
</head>
<body lang='EN-US'>
<ul>
<li id="-a-b-c-">The background of this list item should be green</li>
<li>The background of this second list item should be also green</li>
</ul>
<p>First paragraph</p><div><p>Hello in a paragraph</p></div>
<div><p>Hello in a paragraph</p></div>
<div>Hello again! (with no paragraph)</div>
<div><div><p>Hello in a paragraph</p></div></div>
<div><div><p>Hello in a paragraph</p><p>Another paragraph</p></div></div>
<div></div><div><p>Hello in a paragraph</p><p>Another paragraph</p></div>
<div><section id=first><div><h1></h1></div></section><section id=second></section><section><h5></h5></section></div>
<div><h1></h1></div><main><h1></h1></main><section><h1></h1></section><footer><h1></h1></footer>
<span>1</span><span class=italic>2</span><span class=this>3</span><span>4</span><span class=that>5</span><span class=this>6</span>
<div><h1></h1></div><article><h2></h2></article><section><h2></h2><article><h3></h3></article></section><aside><h3></h3><h3></h3></aside><nav><div><h4></h4></div></nav>
<span style='display: none'>foo</span>
<dd>
<span>
<span>Sub1</span>
</span>
<div>First</div>
<div>
<div>
<a>Second</a>
</div>
</div>
<div>Third</div>
<div>Fourth</div>
<div>
<span>Fifth</span>
</div>
</dd>
<input type='teXt'>
<input id='teXt'>
<body id="theBody">
<div id="myDiv">
<div id="someOtherDiv">subdiv!</div>
<p><a href="http://www.g">hi</a><span class="hyphen-separated">test</span><span>oh</span></p>
</div>
<p class="hiclass">hi!!</p>
<div class="checkit">wooo<p class="omg ohyeah">eeeee</p></div>
<div class="checkit">woootooo<a href="http://colin">we</a></div>
<form>
<input>
</form>
</body>
</body>
</html>`,
"CssSelector2": `
<!DOCTYPE html>
<html lang='en'>
<head>
<meta charset='utf-8'>
<title>Te</title>
</head>
<body lang='EN-US'>
<div class="head">
<p><a href="http://www.w"><img height=48 alt=W3C src="http://www.w" width=72></a>
<h1 id="title">Se</h1>
<h2>W3</h2>
<dl>
<dt>Th<dd><a href="http://www.w">
</a>
<dt>La<dd><a href="http://www.w">
</a>
<dt>Pr<dd><a href="http://www.w">
</a>
<dt><a name=editors-list></a>Ed<dd class="vcard"><span class="fn">Da</span> (</dd>
<dd class="vcard"><a lang="tr" class="url fn" href="http://www.t">Ta</a> (<dd class="vcard"><a href="mailto:ian@h" class="url fn">Ia</a> (<span class="company"><a href="http://www.g">Go</a></span>)
<dd class="vcard"><span class="fn">Pe</span> (<span class="company"><a href="http://www.n">Ne</a></span>)
<dd class="vcard"><span class="fn">Jo</span> (<span class="company"><a href="http://www.q">Qu</a></span>)
</dl>
<p class="copyright"><a href="http://www.w">
</a> &<a href="http://www.w"><abbr title="World Wide Web Consortium">W3</abbr></a><sup>&r</sup>
<a href="http://www.c"><abbr title="Massachusetts
Institute of Technology">MI</abbr></a>, <a href="http://www.e"><acronym title="European Research
Consortium for Informatics and Mathematics">ER</acronym></a>, <a href="http://www.k">Ke</a>),<a href="http://www.w">li</a>,
<a href="http://www.w">tr</a>,
<a href="http://www.w">do</a> r<hr title="Separator for header">
</div>
<h2><a name=abstract></a>Ab</h2>
<p><em>Se</em> a</p>
<p><acronym title="Cascading Style Sheets">CS</acronym> (<acronym title="Hypertext Markup Language">HT</acronym> a<acronym title="Extensible Markup Language">XM</acronym> d<p>Se</p>
<pre>ex</pre>
<p>Th</p>
<p>Th<acronym title="Simple Tree Transformation
Sheets">ST</acronym> (<a href="#refsSTTS">[S</a></p>
<h2><a name=status></a>St</h2>
<p><em>Th<a href="http://www.w">W3</a></em></p>
<p>Th<a href="#refsCSS1"><abbr title="CSS level 1">CS</abbr></a> a<a href="#refsCSS21"><abbr title="CSS level 2">CS</abbr></a>, <abbr title="CSS level
3">CS</abbr> a</p>
<p>Th</p>
<p>Th<a href="http://www.w">CS</a>
<a href="/Style/">St</a>).<a href="http://www.w">Ca</a>, </p>
<p>Al<a href="http://lists">ar</a>)
<a href="http://www.w">ww</a>
<a href="http://www.w">in</a>).</p>
<p>Th<p>Th<a href="http://www.w">tr</a>.
<div class="subtoc">
<h2><a name=contents>Ta</a></h2>
<ul class="toc">
<li class="tocline2"><a href="#context">1.</a>
<ul>
<li><a href="#dependencie">1.</a> </li>
<li><a href="#terminology">1.</a> </li>
<li><a href="#changesFrom">1.</a> </li>
</ul>
<li class="tocline2"><a href="#selectors">2.</a>
<li class="tocline2"><a href="#casesens">3.</a>
<li class="tocline2"><a href="#selector-sy">4.</a>
<li class="tocline2"><a href="#grouping">5.</a>
<li class="tocline2"><a href="#simple-sele">6.</a>
<ul class="toc">
<li class="tocline3"><a href="#type-select">6.</a>
<ul class="toc">
<li class="tocline4"><a href="#typenmsp">6.</a></li>
</ul>
<li class="tocline3"><a href="#universal-s">6.</a>
<ul>
<li><a href="#univnmsp">6.</a></li>
</ul>
<li class="tocline3"><a href="#attribute-s">6.</a>
<ul class="toc">
<li class="tocline4"><a href="#attribute-r">6.</a>
<li><a href="#attribute-s">6.</a>
<li class="tocline4"><a href="#attrnmsp">6.</a>
<li class="tocline4"><a href="#def-values">6.</a></li>
</ul>
<li class="tocline3"><a href="#class-html">6.</a>
<li class="tocline3"><a href="#id-selector">6.</a>
<li class="tocline3"><a href="#pseudo-clas">6.</a>
<ul class="toc">
<li class="tocline4"><a href="#dynamic-pse">6.</a>
<li class="tocline4"><a href="#target-pseu">6.</a>
<li class="tocline4"><a href="#lang-pseudo">6.</a>
<li class="tocline4"><a href="#UIstates">6.</a>
<li class="tocline4"><a href="#structural-">6.</a>
<ul>
<li><a href="#root-pseudo">:r</a>
<li><a href="#nth-child-p">:n</a>
<li><a href="#nth-last-ch">:n</a>
<li><a href="#nth-of-type">:n</a>
<li><a href="#nth-last-of">:n</a>
<li><a href="#first-child">:f</a>
<li><a href="#last-child-">:l</a>
<li><a href="#first-of-ty">:f</a>
<li><a href="#last-of-typ">:l</a>
<li><a href="#only-child-">:o</a>
<li><a href="#only-of-typ">:o</a>
<li><a href="#empty-pseud">:e</a></li>
</ul>
<li class="tocline4"><a href="#negation">6.</a></li>
</ul>
</li>
</ul>
<li><a href="#pseudo-elem">7.</a>
<ul>
<li><a href="#first-line">7.</a>
<li><a href="#first-lette">7.</a>
<li><a href="#UIfragments">7.</a>
<li><a href="#gen-content">7.</a></li>
</ul>
<li class="tocline2"><a href="#combinators">8.</a>
<ul class="toc">
<li class="tocline3"><a href="#descendant-">8.</a>
<li class="tocline3"><a href="#child-combi">8.</a>
<li class="tocline3"><a href="#sibling-com">8.</a>
<ul class="toc">
<li class="tocline4"><a href="#adjacent-si">8.</a>
<li class="tocline4"><a href="#general-sib">8.</a></li>
</ul>
</li>
</ul>
<li class="tocline2"><a href="#specificity">9.</a>
<li class="tocline2"><a href="#w3cselgramm">10</a>
<ul class="toc">
<li class="tocline3"><a href="#grammar">10</a>
<li class="tocline3"><a href="#lex">10</a></li>
</ul>
<li class="tocline2"><a href="#downlevel">11</a>
<li class="tocline2"><a href="#profiling">12</a>
<li><a href="#Conformance">13</a>
<li><a href="#Tests">14</a>
<li><a href="#ACKS">15</a>
<li class="tocline2"><a href="#references">16</a>
</ul>
</div>
<h2><a name=context>1.</a></h2>
<h3><a name=dependencies></a>1.</h3>
<p>So<a href="#refsCSS21">[C</a></p>
<h3><a name=terminology></a>1.</h3>
<p>Al</p>
<h3><a name=changesFromCSS2></a>1.</h3>
<p><em>Th</em></p>
<p>Th<ul>
<li>th</li>
<li>an</li>
<li>a <a href="#general-sib">ne</a> h</li>
<li>ne</li>
<li>ne</li>
<li>th</li>
<li>pr</li>
<li>Se</li>
<li>th</li>
</ul>
<h2><a name=selectors></a>2.</h2>
<p><em>Th</em></p>
<p>A </p>
<p>Se</p>
<p>Th</p>
<table class="selectorsReview">
<thead>
<tr>
<th class="pattern">Pa</th>
<th class="meaning">Me</th>
<th class="described">De</th>
<th class="origin">Fi</th></tr>
<tbody>
<tr>
<td class="pattern">*</td>
<td class="meaning">an</td>
<td class="described"><a href="#universal-s">Un</a></td>
<td class="origin">2</td></tr>
<tr>
<td class="pattern">E</td>
<td class="meaning">an</td>
<td class="described"><a href="#type-select">Ty</a></td>
<td class="origin">1</td></tr>
<tr>
<td class="pattern">E[</td>
<td class="meaning">an</td>
<td class="described"><a href="#attribute-s">At</a></td>
<td class="origin">2</td></tr>
<tr>
<td class="pattern">E[</td>
<td class="meaning">an</td>
<td class="described"><a href="#attribute-s">At</a></td>
<td class="origin">2</td></tr>
<tr>
<td class="pattern">E[</td>
<td class="meaning">an</td>
<td class="described"><a href="#attribute-s">At</a></td>
<td class="origin">2</td></tr>
<tr>
<td class="pattern">E[</td>
<td class="meaning">an</td>
<td class="described"><a href="#attribute-s">At</a></td>
<td class="origin">3</td></tr>
<tr>
<td class="pattern">E[</td>
<td class="meaning">an</td>
<td class="described"><a href="#attribute-s">At</a></td>
<td class="origin">3</td></tr>
<tr>
<td class="pattern">E[</td>
<td class="meaning">an</td>
<td class="described"><a href="#attribute-s">At</a></td>
<td class="origin">3</td></tr>
<tr>
<td class="pattern">E[</td>
<td class="meaning">an</td>
<td class="described"><a href="#attribute-s">At</a></td>
<td class="origin">2</td></tr>
<tr>
<td class="pattern">E:</td>
<td class="meaning">an</td>
<td class="described"><a href="#structural-">St</a></td>
<td class="origin">3</td></tr>
<tr>
<td class="pattern">E:</td>
<td class="meaning">an</td>
<td class="described"><a href="#structural-">St</a></td>
<td class="origin">3</td></tr>
<tr>
<td class="pattern">E:</td>
<td class="meaning">an</td>
<td class="described"><a href="#structural-">St</a></td>
<td class="origin">3</td></tr>
<tr>
<td class="pattern">E:</td>
<td class="meaning">an</td>
<td class="described"><a href="#structural-">St</a></td>
<td class="origin">3</td></tr>
<tr>
<td class="pattern">E:</td>
<td class="meaning">an</td>
<td class="described"><a href="#structural-">St</a></td>
<td class="origin">3</td></tr>
<tr>
<td class="pattern">E:</td>
<td class="meaning">an</td>
<td class="described"><a href="#structural-">St</a></td>
<td class="origin">2</td></tr>
<tr>
<td class="pattern">E:</td>
<td class="meaning">an</td>
<td class="described"><a href="#structural-">St</a></td>
<td class="origin">3</td></tr>
<tr>
<td class="pattern">E:</td>
<td class="meaning">an</td>
<td class="described"><a href="#structural-">St</a></td>
<td class="origin">3</td></tr>
<tr>
<td class="pattern">E:</td>
<td class="meaning">an</td>
<td class="described"><a href="#structural-">St</a></td>
<td class="origin">3</td></tr>
<tr>
<td class="pattern">E:</td>
<td class="meaning">an</td>
<td class="described"><a href="#structural-">St</a></td>
<td class="origin">3</td></tr>
<tr>
<td class="pattern">E:</td>
<td class="meaning">an</td>
<td class="described"><a href="#structural-">St</a></td>
<td class="origin">3</td></tr>
<tr>
<td class="pattern">E:</td>
<td class="meaning">an</td>
<td class="described"><a href="#structural-">St</a></td>
<td class="origin">3</td></tr>
<tr>
<td class="pattern">E:<br>E:</td>
<td class="meaning">an</td>
<td class="described"><a href="#link">Th</a></td>
<td class="origin">1</td></tr>
<tr>
<td class="pattern">E:<br>E:<br>E:</td>
<td class="meaning">an</td>
<td class="described"><a href="#useraction-">Th</a></td>
<td class="origin">1 </td></tr>
<tr>
<td class="pattern">E:</td>
<td class="meaning">an</td>
<td class="described"><a href="#target-pseu">Th</a></td>
<td class="origin">3</td></tr>
<tr>
<td class="pattern">E:</td>
<td class="meaning">an</td>
<td class="described"><a href="#lang-pseudo">Th</a></td>
<td class="origin">2</td></tr>
<tr>
<td class="pattern">E:<br>E:</td>
<td class="meaning">a </td>
<td class="described"><a href="#UIstates">Th</a></td>
<td class="origin">3</td></tr>
<tr>
<td class="pattern">E:<!--<b--></td>
<td class="meaning">a <!-- o--> (</td>
<td class="described"><a href="#UIstates">Th</a></td>
<td class="origin">3</td></tr>
<tr>
<td class="pattern">E:</td>
<td class="meaning">th</td>
<td class="described"><a href="#first-line">Th</a></td>
<td class="origin">1</td></tr>
<tr>
<td class="pattern">E:</td>
<td class="meaning">th</td>
<td class="described"><a href="#first-lette">Th</a></td>
<td class="origin">1</td></tr>
<tr>
<td class="pattern">E:</td>
<td class="meaning">th</td>
<td class="described"><a href="#UIfragments">Th</a></td>
<td class="origin">3</td></tr>
<tr>
<td class="pattern">E:</td>
<td class="meaning">ge</td>
<td class="described"><a href="#gen-content">Th</a></td>
<td class="origin">2</td></tr>
<tr>
<td class="pattern">E:</td>
<td class="meaning">ge</td>
<td class="described"><a href="#gen-content">Th</a></td>
<td class="origin">2</td></tr>
<tr>
<td class="pattern">E.</td>
<td class="meaning">an</td>
<td class="described"><a href="#class-html">Cl</a></td>
<td class="origin">1</td></tr>
<tr>
<td class="pattern">E#</td>
<td class="meaning">an</td>
<td class="described"><a href="#id-selector">ID</a></td>
<td class="origin">1</td></tr>
<tr>
<td class="pattern">E:</td>
<td class="meaning">an</td>
<td class="described"><a href="#negation">Ne</a></td>
<td class="origin">3</td></tr>
<tr>
<td class="pattern">E </td>
<td class="meaning">an</td>
<td class="described"><a href="#descendant-">De</a></td>
<td class="origin">1</td></tr>
<tr>
<td class="pattern">E </td>
<td class="meaning">an</td>
<td class="described"><a href="#child-combi">Ch</a></td>
<td class="origin">2</td></tr>
<tr>
<td class="pattern">E </td>
<td class="meaning">an</td>
<td class="described"><a href="#adjacent-si">Ad</a></td>
<td class="origin">2</td></tr>
<tr>
<td class="pattern">E </td>
<td class="meaning">an</td>
<td class="described"><a href="#general-sib">Ge</a></td>
<td class="origin">3</td></tr></tbody></table>
<p>Th</p>
<h2><a name=casesens>3.</a></h2>
<p>Th</p>
<h2><a name=selector-syntax>4.</a></h2>
<p>A <dfn><a name=selector>se</a></dfn> i<a href="#sequence">se</a>
<a href="#combinators">co</a>.</p>
<p>A <dfn><a name=sequence>se</a></dfn>
<a href="#simple-sele">si</a>
<a href="#combinators">co</a>. <a href="#type-select">ty</a> o<a href="#universal-s">un</a>. </p>
<p>A <dfn><a name=simple-selectors-dfn></a><a href="#simple-sele">si</a></dfn> i<a href="#type-select">ty</a>, <a href="#universal-s">un</a>, <a href="#attribute-s">at</a>, <a href="#class-html">cl</a>, <a href="#id-selector">ID</a>, <a href="#content-sel">co</a>, <a href="#pseudo-clas">ps</a>. <a href="#pseudo-elem">ps</a> m</p>
<p><dfn>Co</dfn> a<code>&g</code>),<code>+</code>) <code>~</code>).<a name=whitespace></a>On</p>
<p>Th<dfn><a name=subject></a>su</dfn>. </p>
<p>An<a href="#Conformance">in</a>.</p>
<h2><a name=grouping>5.</a></h2>
<p>Wh</p>
<div class="example">
<p>CS</p>
<p>In</p>
<pre>h1</pre>
<p>is</p>
<pre>h1</pre>
</div>
<p><strong>Wa</strong>: </p>
<h2><a name=simple-selectors>6.</a></h2>
<h3><a name=type-selectors>6.</a></h3>
<p>A <dfn>ty</dfn> i</p>
<div class="example">
<p>Ex</p>
<p>Th<code>h1</code> e</p>
<pre>h1</pre>
</div>
<h4><a name=typenmsp>6.</a></h4>
<p>Ty<a href="#refsXMLNAME">[X</a>) <code>|</code>).</p>
<p>Th</p>
<p>An</p>
<p>El<code>*|</code>")</p>
<p>A <a href="#Conformance">in</a> s</p>
<p>In<a href="http://www.w">lo</a>
<a href="http://www.w">qu</a>. <a href="#downlevel">be</a> f</p>
<p>In</p>
<dl>
<dt><code>ns</code></dt>
<dd>el</dd>
<dt><code>*|</code></dt>
<dd>el</dd>
<dt><code>|E</code></dt>
<dd>el</dd>
<dt><code>E</code></dt>
<dd>if</dd>
</dl>
<div class="example">
<p>CS</p>
<pre>@n</pre>
<p>Th<code>h1</code> e</p>
<p>Th</p>
<p>Th<code>h1</code> e</p>
<p>Th<code>h1</code> e</p>
<p>Th</p>
</div>
<h3><a name=universal-selector>6.</a> </h3>
<p>Th<dfn>un</dfn>, <code>*</code>),<a href="#univnmsp">Un</a> b</p>
<p>If<code>*</code> m</p>
<div class="example">
<p>Ex</p>
<ul>
<li><code>*[</code> a<code>[h</code> a</li>
<li><code>*.</code> a<code>.w</code> a</li>
<li><code>*#</code> a<code>#m</code> a</li>
</ul>
</div>
<p class="note"><strong>No</strong> i<code>*</code>, </p>
<h4><a name=univnmsp>6.</a></h4>
<p>Th</p>
<dl>
<dt><code>ns</code></dt>
<dd>al</dd>
<dt><code>*|</code></dt>
<dd>al</dd>
<dt><code>|*</code></dt>
<dd>al</dd>
<dt><code>*</code></dt>
<dd>if</dd>
</dl>
<p>A <a href="#Conformance">in</a>
</p>
<h3><a name=attribute-selectors>6.</a></h3>
<p>Se</p>
<h4><a name=attribute-representation>6.</a></h4>
<p>CS</p>
<dl>
<dt><code>[a</code>
<dd>Re<code>at</code> a</dd>
<dt><code>[a</code></dt>
<dd>Re<code>at</code> a</dd>
<dt><code>[a</code></dt>
<dd>Re<code>at</code> a<a href="#whitespace">wh</a>-s<em>se</em> b</dd>
<dt><code>[a</code>
<dd>Re<code>at</code> a<code>hr</code> a<code>li</code> e<a href="#refsRFC3066">[R</a>).<code>la</code> (<code>xm</code>) <a href="#lang-pseudo">th<code>:l</code> p</a>.</dd>
</dl>
<p>At</p>
<div class="example">
<p>Ex</p>
<p>Th<code>h1</code>
<code>ti</code> a</p>
<pre>h1</pre>
<p>In<code>sp</code> e<code>cl</code> a</p>
<pre>sp</pre>
<p>Mu<code>sp</code> e<code>he</code> a<code>go</code> a</p>
<pre>sp</pre>
<p>Th<code>re</code> a<code>a</code> e<code>hr</code> a</p>
<pre>a[</pre>
<p>Th<code>li</code> e<code>hr</code> a</p>
<pre>li</pre>
<p>Th<code>li</code> e<code>hr</code> a</p>
<pre>li</pre>
<p>Si<code>DI</code> e<code>ch</code>:</p>
<pre>DI</pre>
</div>
<h4><a name=attribute-substrings></a>6.</h4>
<p>Th</p>
<dl>
<dt><code>[a</code></dt>
<dd>Re<code>at</code> a</dd>
<dt><code>[a</code>
<dd>Re<code>at</code> a</dd>
<dt><code>[a</code>
<dd>Re<code>at</code> a</dd>
</dl>
<p>At</p>
<div class="example">
<p>Ex</p>
<p>Th<code>ob</code>, </p>
<pre>ob</pre>
<p>Th<code>a</code> w<code>hr</code> a</p>
<pre>a[</pre>
<p>Th<code>ti</code>
</p>
<pre>p[</pre>
</div>
<h4><a name=attrnmsp>6.</a></h4>
<p>At<code>|</code>).<code>|a</code>")<p>An<a href="#Conformance">in</a> s<div class="example">
<p>CS</p>
<pre>@n</pre>
<p>Th<code>at</code> i</p>
<p>Th<code>at</code> r</p>
<p>Th<code>at</code> w</p>
</div>
<h4><a name=def-values>6.</a></h4>
<p>At</p>
<p>Mo<em>no</em> r<em>is</em> r<a href="#refsXML10">[X</a> f</p>
<p>A <a href="#refsXMLNAME">[X</a> i</p>
<p class="note"><strong>No</strong> T</p>
<div class="example">
<p>Ex</p>
<p>Co</p>
<pre class="dtd-example">&l</pre>
<p>If</p>
<pre>EX</pre>
<p>th</p>
<pre>EX</pre>
<p>He<code>EX</code> i</p>
</div>
<h3><a name=class-html>6.</a></h3>
<p>Wo<code>.</code>) <code>~=</code>
<code>cl</code> a<code>di</code> a<code>di</code> h<code>.</code>).</p>
<p>UA<a href="#refsSVG">[S</a> d<a href="http://www.w">SV</a> a<a href="#refsMATH">[M</a> d<a href="http://www.w">Ma</a>.)</p>
<div class="example">
<p>CS</p>
<p>We<code>cl</code> a</p>
<pre>*.</pre>
<p>or</p>
<pre>.p</pre>
<p>Th<code>cl</code>:</p>
<pre>H1</pre>
<p>Gi</p>
<pre>&l</pre>
</div>
<p>To</p>
<div class="example">
<p>CS</p>
<p>Th<a href="#whitespace">wh</a>-s</p>
<pre>p.</pre>
<p>Th<code>cl</code> b<code>cl</code>.</p>
</div>
<p class="note"><strong>No</strong> B</p>
<p class="note"><strong>No</strong> I</p>
<h3><a name=id-selectors>6.</a></h3>
<p>Do</p>
<p>An<code>#</code>) </p>
<p>Se<div class="example">
<p>Ex</p>
<p>Th<code>h1</code> e</p>
<pre>h1</pre>
<p>Th</p>
<pre>#c</pre>
<p>Th</p>
<pre>*#</pre>
</div>
<p class="note"><strong>No</strong> I<a href="#refsXML10">[X</a>, <code>[n</code> i<code>#p</code>. </p>
<p>If</p>
<h3><a name=pseudo-classes>6.</a></h3>
<p>Th</p>
<p>A <code>:</code>) </p>
<p>Ps</p>
<h4><a name=dynamic-pseudos>6.</a></h4>
<p>Dy</p>
<p>Dy</p>
<h5>Th<a name=link>li</a></h5>
<p>Us<code>:l</code> a<code>:v</code> t</p>
<ul>
<li>Th<code>:l</code> p</li>
<li>Th<code>:v</code> p</li>
</ul>
<p>Af</p>
<p>Th</p>
<div class="example">
<p>Ex</p>
<p>Th<code>ex</code> a</p>
<pre>a.</pre>
</div>
<p class="note"><strong>No</strong> I<p>UA</p>
<h5>Th<a name=useraction-pseudos>us</a></h5>
<p>In</p>
<ul>
<li>Th<code>:h</code> p<a href="http://www.w">in</a> d<a href="http://www.w">in</a> m</li>
<li>Th<code>:a</code> p</li>
<li>Th<code>:f</code> p</li>
</ul>
<p>Th<code>:a</code> o<code>:f</code>.</p>
<p>Th</p>
<p>Se</p>
<div class="example">
<p>Ex</p>
<pre>a:</pre>
<p>An</p>
<pre>a:</pre>
<p>Th<code>a</code> e</p>
</div>
<p class="note"><strong>No</strong> A</p>
<h4><a name=target-pseudo>6.</a></h4>
<p>So</p>
<p>UR<code>se</code> i</p>
<pre>ht</pre>
<p>A <code>:t</code>
</p>
<div class="example">
<p>Ex</p>
<pre>p.</pre>
<p>Th<code>p</code> e<code>no</code> t</p>
</div>
<div class="example">
<p>CS</p>
<p>He<code>:t</code> p</p>
<pre>*:</pre>
</div>
<h4><a name=lang-pseudo>6.</a></h4>
<p>If<a href="#refsHTML4">[H</a>, <code>la</code> a<code>me</code>
<code>xm</code>, </p>
<p>Th<code>:l</code> r<code>:l</code> s<a href="#attribute-r">'|</a> o</p>
<p>C </p>
<p class="note"><strong>No</strong> I<a href="#refsRFC3066">[R</a> o<a href="#refsXML10">[X</a>. <a href="http://www.w">
</a></p>
<div class="example">
<p>Ex</p>
<p>Th<code>q</code> q</p>
<pre>ht</pre>
</div>
<h4><a name=UIstates>6.</a></h4>
<h5><a name=enableddisabled>Th</a></h5>
<p>Th<code>:e</code> p<code>in</code> e</p>
<p>Si<code>:e</code>, <code>:d</code> a</p>
<p>Mo</p>
<h5><a name=checked>Th</a></h5>
<p>Ra<code>:c</code> p<code>:c</code> p<code>se</code> a<code>ch</code>
<a href="http://www.w">Se</a>, <code>:c</code> p<code>:c</code> p<code>se</code> a<code>ch</code> a<h5><a name=indeterminate>Th</a></h5>
<div class="note">
<p>Ra</p>
<p>A <code>:i</code> p<!--Wh--></p>
</div>
<h4><a name=structural-pseudos>6.</a></h4>
<p>Se<dfn>st</dfn> t<p>No<h5><a name=root-pseudo>:r</a></h5>
<p>Th<code>:r</code> p<code>HT</code> e<h5><a name=nth-child-pseudo>:n</a></h5>
<p>Th<code>:n<var>a</var><code>n</code>+<var>b</var>)</code>
<var>a</var><code>n</code>+<var>b</var>-1<strong>be</strong> i<code>n</code>, <var>b</var>th<var>a</var> e<var>a</var> a<var>b</var> v<p>In<code>:n</code> c<code>od</code>' <code>ev</code>' <code>od</code>' <code>2n</code>,
<code>ev</code>' <code>2n</code>.
<div class="example">
<p>Ex</p>
<pre>tr</pre>
</div>
<p>Wh<var>a</var>=0<code>:n</code> m<var>a</var>=0<var>a</var><code>n</code> p<code>:n<var>b</var>)</code> a<code>:n</code>.
<div class="example">
<p>Ex</p>
<pre>fo</pre>
</div>
<p>Wh<var>a</var>=1<div class="example">
<p>Ex</p>
<p>Th</p>
<pre>ba</pre>
</div>
<p>If<var>b</var>=0<var>a</var>th<var>b</var> p<div class="example">
<p>Ex</p>
<pre>tr</pre>
</div>
<p>If<var>a</var> a<var>b</var> a</p>
<p>Th<var>a</var> c<var>a</var><code>n</code>+<var>b</var>, <code>n</code>&g</p>
<div class="example">
<p>Ex</p>
<pre>ht</pre>
</div>
<p>Wh<var>b</var> i<var>b</var>).</p>
<div class="example">
<p>Ex</p>
<pre>:n</pre>
</div>
<h5><a name=nth-last-child-pseudo>:n</a></h5>
<p>Th<code>:n<var>a</var>n+<var>b</var>)</code>
<var>a</var><code>n</code>+<var>b</var>-1<strong>af</strong> i<code>n</code>, <code>:n</code> p<code>ev</code>' <code>od</code>' <div class="example">
<p>Ex</p>
<pre>tr</pre>
</div>
<h5><a name=nth-of-type-pseudo>:n</a></h5>
<p>Th<code>:n<var>a</var>n+<var>b</var>)</code>
<var>a</var><code>n</code>+<var>b</var>-1<strong>be</strong> i<code>n</code>, <var>b</var>th<code>:n</code> p<code>ev</code>' <code>od</code>' <div class="example">
<p>CS</p>
<p>Th</p>
<pre>im</pre>
</div>
<h5><a name=nth-last-of-type-pseudo>:n</a></h5>
<p>Th<code>:n<var>a</var>n+<var>b</var>)</code>
<var>a</var><code>n</code>+<var>b</var>-1<strong>af</strong> i<code>n</code>, <code>:n</code> p<code>ev</code>' <code>od</code>' <div class="example">
<p>Ex</p>
<p>To<code>h2</code> c<code>bo</code> e</p>
<pre>bo</pre>
<p>In<code>:n</code>, </p>
<pre>bo</pre>
</div>
<h5><a name=first-child-pseudo>:f</a></h5>
<p>Sa<code>:n</code>. <code>:f</code> p<div class="example">
<p>Ex</p>
<p>Th<code>p</code> e<code>di</code> e</p>
<pre>di</pre>
<p>Th<code>p</code> i<code>di</code> o</p>
<pre>&l</pre>bu<code>p</code> i<pre>&l</pre>
<p>Th</p>
<pre>* </pre>
</div>
<h5><a name=last-child-pseudo>:l</a></h5>
<p>Sa<code>:n</code>. <code>:l</code> p<div class="example">
<p>Ex</p>
<p>Th<code>li</code> t<code>ol</code>.
<pre>ol</pre>
</div>
<h5><a name=first-of-type-pseudo>:f</a></h5>
<p>Sa<code>:n</code>. <code>:f</code> p<div class="example">
<p>Ex</p>
<p>Th<code>dt</code> i<code>dl</code>, <code>dt</code> b</p>
<pre>dl</pre>
<p>It<code>dt</code>
</p>
<pre>&l</pre>
</div>
<h5><a name=last-of-type-pseudo>:l</a></h5>
<p>Sa<code>:n</code>. <code>:l</code> p</p>
<div class="example">
<p>Ex</p>
<p>Th<code>td</code> o</p>
<pre>tr</pre>
</div>
<h5><a name=only-child-pseudo>:o</a></h5>
<p>Re<code>:f</code> o<code>:n</code>, </p>
<h5><a name=only-of-type-pseudo>:o</a></h5>
<p>Re<code>:f</code> o<code>:n</code>, </p>
<h5><a name=empty-pseudo></a>:e</h5>
<p>Th<code>:e</code> p</p>
<div class="example">
<p>Ex</p>
<p><code>p:</code> i</p>
<pre>&l</pre>
<p><code>fo</code> i</p>
<pre>&l</pre>
<pre>&l</pre>
<pre>&l</pre>
</div>
<h4><a name=content-selectors>6.</a></h4> <!-- I-->
<p>Th</p>
<!-- (-->
<h4><a name=negation></a>6.</h4>
<p>Th<code>:n<var>X</var>)</code>, <a href="#simple-sele">si</a> (<!-- p-->
<div class="example">
<p>Ex</p>
<p>Th<code>bu</code>
</p>
<pre>bu</pre>
<p>Th<code>FO</code>
</p>
<pre>*:</pre>
<p>Th</p>
<pre>ht</pre>
</div>
<p>De</p>
<div class="example">
<p>Ex</p>
<p>As</p>
<pre>*|</pre>
<p>Th<em>ar</em> b</p>
<pre>*|</pre>
</div>
<p class="note"><strong>No</strong>: <code>:n</code>,
<code>fo</code>,
<code>fo</code> b</p>
<h3><a name=pseudo-elements>7.</a></h3>
<p>Ps<code>::</code> a<code>::</code> p</p>
<p>A <code>::</code>) </p>
<p>Th<code>::</code> n<code>:f</code>, <code>:f</code>,
<code>:b</code> a<code>:a</code>).</p>
<p>On<a href="#subject">su</a> o<span class="note">A
</span></p>
<h4><a name=first-line>7.</a></h4>
<p>Th<code>::</code> p<div class="example">
<p>CS</p>
<pre>p:</pre>
<p>Th</p>
</div>
<p>Th<code>p:</code> d</p>
<p>No</p>
<pre>
&</pre>
<p>th<pre>
T</pre>
<p>Th<em>fi</em> f<code>::</code>. </p>
<pre>
&<b>&l</b> T<b>&l</b> w</pre>
<p>If<code>sp</code> e</p>
<pre>
&<b>&l</b> T<b>&l</b> T</pre>
<p>th<code>sp</code> w<code>::</code>.
<pre>
&<b>&l</b> T<b>&l</b>&l<b>&l</b> b<b>&l</b> T</pre>
<p>In<code>::</code> p</p>
<p><a name="first-formatted-line"></a>Th<code>di</code> i<code>&l</code> i<code>p</code> (<code>p</code> a<code>di</code> a<p>Th<code>&l</code> t<code>di</code> i<p class="note">No<code>p</code> i<code>&l</code> d<code>br</code> i<p>A <code>::</code> p</p>
<pre>
&</pre>
<p>is</p>
<pre>
&</pre>
<p>Th<code>::</code> p<code>::</code>
</p>
<h4><a name=first-letter>7.</a></h4>
<p>Th<code>::</code> p</p>
<p>In<code>::</code>
</p>
<div class="example">
<p>Ex</p>
<p>Th<code>::</code>
<span>sp</span>, <span>sp</span>:
<pre>
p</pre>
<div class="figure">
<p><img src="initial-cap." alt="Image illustrating the ::first-letter pseudo-element">
</div>
</div>
<div class="example">
<p>Th</p>
<pre>
&</pre>
<p>Th</p>
<div class="figure">
<p><img src="first-letter" alt="Image illustrating the combined effect of the ::first-letter and ::first-line pseudo-elements"></p>
</div>
<p>Th<span class="index-inst" title="fictional tag
sequence">fi</span> i</p>
<pre>
&</pre>
<p>No<code>::</code> p</p> </div>
<p>In</p>
<p>Pu<a href="#refsUNICODE">[U</a></p>
<div class="figure">
<p><img src="first-letter" alt="Quotes that precede the
first letter should be included."></p>
</div>
<p>Th<code>::</code> a</p>
<p>In<code>::</code> p<span class="note">A </span></p>
<p>Th<code>::</code> p</p>
<div class="example">
<p>Ex</p>
<p>Th<pre>&l</pre>
<p>is<pre>&l</pre>
</div>
<p>Th<code>&l</code> t<code>di</code> i<code>di</code> d<p>Th<a href="#first-forma">fi</a> F<code>&l</code> t<code>::</code> d<code>br</code> i<p>In<code>::</code> a<code>::</code> o<code>::</code> o<code>::</code> c<code>::</code> a<em>in</em> t<div class="example">
<p>Ex</p>
<p>Af</p>
</div>
<p>So<code>::</code> p<p>If<code>&l</code>, </p>
<p>Si<div class="example">
<p>Ex</p>
<p><a name="overlapping-example">Th</a> i</p>
<pre>p </pre>
<p>As<span class="index-inst" title="fictional tag sequence">fi</span> f</p>
<pre>&l</pre>
<p>No<code>::</code> e<code>::</code>
<code>::</code> a<code>::</code>, <code>::</code>.</p>
</div>
<h4><a name=UIfragments>7.</a> <a name=selection>Th</a></h4>
<p>Th<code>::</code> p<code><a href="#checked">:c</a></code> p<code>:s</code>)
<p>Al<code>::</code> p<a href="#refsCSS21">[C</a>) <code>::</code> s<code>::</code>
<p>Th<code>::</code>
<code>::</code> m<h4><a name=gen-content>7.</a></h4>
<p>Th<code>::</code> a<code>::</code> p<a href="#refsCSS21">[C</a>.</p>
<p>Wh<code>::</code> a<code>::</code>
<code>::</code> a<code>::</code>, </p>
<h2><a name=combinators>8.</a></h2>
<h3><a name=descendant-combinators>8.</a></h3>
<p>At<code>EM</code> e<code>H1</code>
<a href="#whitespace">wh</a> t<code>A </code>" <code>B</code> t<code>A</code>.
<div class="example">
<p>Ex</p>
<p>Fo</p>
<pre>h1</pre>
<p>It<code>em</code> e<code>h1</code> e</p>
<pre>&l</pre>
<p>Th</p>
<pre>di</pre>
<p>re<code>p</code> e<code>di</code> e</p>
<p>Th<a href="#attribute-s">at</a>, <code>hr</code> a<code>p</code> t<code>di</code>:</p>
<pre>di</pre>
</div>
<h3><a name=child-combinators>8.</a></h3>
<p>A <dfn>ch</dfn> d<code>&g</code>) <div class="example">
<p>Ex</p>
<p>Th<code>p</code> e<code>bo</code>:</p>
<pre>bo</pre>
<p>Th</p>
<pre>di</pre><!-- L-->
<p>It<code>p</code> e<code>li</code> e<code>li</code> e<code>ol</code> e<code>ol</code> e<code>di</code>. </p>
</div>
<p>Fo<code><a href="#structural-">:f</a></code> p</p>
<h3><a name=sibling-combinators>8.</a></h3>
<p>Th</p>
<h4><a name=adjacent-sibling-combinators>8.</a></h4>
<p>Th<code>+</code>) </p>
<div class="example">
<p>Ex</p>
<p>Th<code>p</code> e<code>ma</code> e</p>
<pre>ma</pre>
<p>Th<code>h1</code> e<code>cl</code>:</p>
<pre>h1</pre>
</div>
<h4><a name=general-sibling-combinators>8.</a></h4>
<p>Th<code>~</code>) </p>
<div class="example">
<p>Ex</p>
<pre>h1</pre>
<p>re<code>pr</code> e<code>h1</code>. </p>
<pre>&l</pre>
</div>
<h2><a name=specificity>9.</a></h2>
<p>A </p>
<ul>
<li>co</li>
<li>co</li>
<li>co</li>
<li>ig</li>
</ul>
<p>Se<a href="#negation">th</a>
</p>
<p>Co</p>
<div class="example">
<p>Ex</p>
<pre>* </pre>
</div>
<p class="note"><strong>No</strong> t<code>st</code> a<a href="#refsCSS21">[C</a>.</p>
<h2><a name=w3cselgrammar>10</a></h2>
<h3><a name=grammar>10</a></h3>
<p>Th<a href="#refsYACC">[Y</a>)
</p>
<ul>
<li><b>*</b>: <li><b>+</b>: <li><b>?</b>: <li><b>|</b>: <li><b>[ </b>: </li>
</ul>
<p>Th</p>
<pre>se</pre>
<h3><a name=lex>10</a></h3>
<p>Th<a name=x3>to</a>, <a href="#refsFLEX">[F</a>) </p>
<p>Th<a href="#refsUNICODE">[U</a></p>
<pre>%o</pre>
<h2><a name=downlevel>11</a></h2>
<p>An</p>
<p>It<code>@n</code> a</p>
<p>Th</p>
<p>Th</p>
<ol>
<li>
<p>Th</p>
<ul>
<li>In</li>
<li>In<code>|n</code>")</li>
</ul>
</li>
<li>
<p>Th</p>
<ul>
<li>In</li>
</ul>
</li>
<li>
<p>Th<b>no</b> u</p>
<ul>
<li>In<a href="#typenmsp">Ty</a> s<code>\:</code>"
<code>ht</code>" <code>&l</code>. </li>
<li>No<em>on</em> m</li>
</ul>
</li>
</ol>
<p>In<em>di</em> n</p>
<h2><a name=profiling>12</a></h2>
<p>Ea</p>
<p>No<div class="profile">
<table class="tprofile">
<tbody>
<tr>
<th class="title" colspan=2>Se</th></tr>
<tr>
<th>Sp</th>
<td>CS</td></tr>
<tr>
<th>Ac</th>
<td>ty<br>cl<br>ID<br>:l<br>de<br>::</td></tr>
<tr>
<th>Ex</th>
<td>
<p>un<br>at<br>:h<br>:t<br>:l<br>al<br>al<br>ne<br>al<br>::<br>ch<br>si<p>na</td></tr>
<tr>
<th>Ex</th>
<td>on</td></tr></tbody></table><br><br>
<table class="tprofile">
<tbody>
<tr>
<th class="title" colspan=2>Se</th></tr>
<tr>
<th>Sp</th>
<td>CS</td></tr>
<tr>
<th>Ac</th>
<td>ty<br>un<br>at<br>cl<br>ID<br>:l<br>de<br>ch<br>ad<br>::<br>::</td></tr>
<tr>
<th>Ex</th>
<td>
<p>co<br>su<br>:t<br>al<br>al<br>ne<br>al<br>ge<p>na</td></tr>
<tr>
<th>Ex</th>
<td>mo</td></tr></tbody></table>
<p>In<p>Th<b>ma</b> a<code>a</code>
<code>na</code> s<code>h1</code>:
<pre>h1</pre>
<p>Al</div>
<div class="profile">
<table class="tprofile">
<tbody>
<tr>
<th class="title" colspan=2>Se</th></tr>
<tr>
<th>Sp</th>
<td>ST</td>
</tr>
<tr>
<th>Ac</th>
<td>
<p>ty<br>un<br>at<br>cl<br>ID<br>al<br>
<p>na</td></tr>
<tr>
<th>Ex</th>
<td>no<br>ps<br></td></tr>
<tr>
<th>Ex</th>
<td>so</td></tr></tbody></table>
<p>Se<ol>
<li>a <li>fr</li></ol></div>
<h2><a name=Conformance></a>13</h2>
<p>Th<p>Th<p>Al<a href="#profiling">Pr</a> l<p>In<p>Us<ul>
<li>a </li>
<li>a </li>
<li>a </li>
</ul>
<p>Sp</p>
<!-- A-->
<h2><a name=Tests></a>14</h2>
<p>Th<a href="http://www.w">a </a> a</p>
<h2><a name=ACKS></a>15</h2>
<p>Th</p>
<p>Th</p>
<h2><a name=references>16</a></h2>
<dl class="refs">
<dt>[C<dd><a name=refsCSS1></a> B<cite>Ca</cite>",<dd>(<code><a href="http://www.w">ht</a></code>)
<dt>[C<dd><a name=refsCSS21></a> B<cite>Ca</cite>",<dd>(<code><a href="http://www.w">ht</a></code>)
<dt>[C<dd><a name=refsCWWW></a> M<cite>Ch</cite>",<dd>(<code><a href="http://www.w">ht</a></code>)
<dt>[F<dd><a name="refsFLEX"></a> "<cite>Fl</cite>",<dt>[H<dd><a name="refsHTML4"></a> D<cite>HT</cite>",<dd>(<a href="http://www.w"><code>ht</code></a>)
<dt>[M<dd><a name="refsMATH"></a> P<cite>Ma</cite>",<dd>(<code><a href="http://www.w">ht</a></code>)
<dt>[R<dd><a name="refsRFC3066"></a> H<cite>Ta</cite>",<dd>(<a href="http://www.i"><code>ht</code></a>)
<dt>[S<dd><a name=refsSTTS></a> D<cite>Si</cite>",<dd>(<code><a href="http://www.w">ht</a></code>)
<dt>[S<dd><a name="refsSVG"></a> J<cite>Sc</cite>",<dd>(<code><a href="http://www.w">ht</a></code>)
<dt>[U</dt>
<dd><a name="refsUNICODE"></a> <cite><a href="http://www.u">Th</a></cite>, <a href="http://www.u">Un</a> a<a href="http://www.u">Un</a>.
<dd>(<code><a href="http://www.u">ht</a></code>)</dd>
<dt>[X<dd><a name="refsXML10"></a> T<cite>Ex</cite>",<dd>(<a href="http://www.w"><code>ht</code></a>)
<dt>[X<dd><a name="refsXMLNAMES"></a> T<cite>Na</cite>",<dd>(<a href="http://www.w"><code>ht</code></a>)
<dt>[Y<dd><a name="refsYACC"></a> S<cite>YA</cite>",</dl>
</body>
</html>`,
"CssToXPath": `
<!DOCTYPE html>
<html lang='en'>
<head>
<meta charset='utf-8'>
<title>Test</title>
</head>
<body lang='EN-US'>
<p class='XYZΨΩ' title='ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ'>Greek uppercase</p>
<div>
<div>d1</div>
<p class='p1'>p1</p>
</div>
<div>
<div>d2</div>
<p class='p2'>p2</p>
<p class='p3'>p3</p>
<p class='p4'>p4</p>
</div>
<div>
<div>d3</div>
<span>span</span>
<p class='p5'>p5</p>
</div>
<div>
<div>d1</div>
<p class='p1'>p1</p>
</div>
<div>
<div>d2</div>
<p class='p2'>
<span>span1</span>
<b>b1</b>
</p>
</div>
<div>
<div>d3</div>
<p class='p3'>
<span>span2</span>
<b>b2</b>
</p>
</div>
<article>
<div dir='rtl'>
<span>test rtl</span>
<div dir='ltr'>
<span>test1 ltr</span>
<div dir='rtl'>עִבְרִית rtl<span>test2 rtl</span></div>
<span>test3 ltr</span>
<div dir='rtl'><span>test6 rtl</span></div>
<div><span>test7 ltr</span></div>
</div>
<span>test8 rtl</span>
</div>
<div dir='ltr'>
<span>test ltr</span>
<div dir='rtl'>
<span>test1 rtl</span>
<div dir='ltr'>ltr<span>test2 ltr</span></div>
<span>test3 rtl</span>
<div dir='ltr'><span>test6 ltr</span></div>
<div><span>test7 rtl</span></div>
</div>
<span>test8 ltr</span>
</div>
</article>
<article lang='en'>
<div lang='en-us'>
<p class='p1'>1.</p>
<p class='p2'>2.</p>
<p class='p3'>3.</p>
<p class='P4'>4.</p>
</div>
</article>
<article lang='fr'>
<div>
<p class='p1'>5.</p>
</div>
<div>
<p class='p2'>6.</p>
<p class='p3'>7.</p>
</div>
<p lang='de-Latn-DE-1996'>8.</p>
<p lang='en-GB'>10.</p>
<p lang='fr-Latn-FR'>12.</p>
<p lang='de'>8.</p>
<p lang='en'>9.</p>
<p lang='en-GB'>10.</p>
<p lang='fr'>11.</p>
<p lang='fr-Latn-FR'>12.</p>
<p lang='fr-Latn-FR-1996'>12.</p>
</article>
<div>
<p class='c1'>1.</p>
<h2>h2.</h2>
<p class='c2'>2.</p>
<p class='c3'>3.</p>
<h2>h2.</h2>
<p class='c4'>4</p>
<p class='c5'>5</p>
<p class='c6'>6</p>
</div>
<ul id='list'>
<li class='c1' title='Item One'>1</li>
<li class='c2' title='Item Two'>2</li>
<li class='c3'>3</li>
<li class='c4'>4</li>
<li class='c5'>5</li>
<li class='c6'>6</li>
<li class='c7'>7</li>
<li class='c8'>8</li>
<li class='c9'>9</li>
<li class='c10'>10</li>
</ul>
<ul id='list'>
<li class='c1' title='Item One'><b>1</b></li>
<li class='c2' title='Item Two'><b>2</b></li>
<li class='c3'><b>3</b></li>
<li class='c4'><b>4</b></li>
<li class='c5'><b>5</b></li>
<li class='c6'><b>6</b></li>
<li class='c7'><b>7</b></li>
</ul>
<div>
<div>d1</div>
<p class='p1'>p1</p>
</div>
<div>
<div>d2</div>
<p class='p2'>p2</p>
</div>
<div>
<div>d3</div>
<span>span</span>
</div>
<ul id='list'>
<li class='c1' title='Item One'>1</li>
<li class='c2' title='Item Two'>2</li>
<li class='c3'>3</li>
<li class='c4'>4</li>
<li class='c5'>5</li>
<li class='c6'>6</li>
<li class='c7'>7</li>
<li class='c8'>8</li>
<li class='c9'>9</li>
</ul>
<div>
<div>d1</div>
<p class='p0'>p0</p>
<p class='p1'>p1</p>
</div>
<div>
<div>d2</div>
<p class='p2'>p2</p>
</div>
<div>
<div>d3</div>
<span>span</span>
</div>
<ul id='list'>
<li class='c1' title='Item One'>1</li>
<li class='c2' title='Item Two'>2</li>
<li class='c3'>3</li>
<li class='c4'>4</li>
<li class='c5'>5</li>
<li class='c6'>6</li>
<li class='c7'>7</li>
</ul>
<main id='main'>
<div id='header'>
<h1>Test</h1>
</div>
<div class='descr'>
<p class='p1'><b>Css to XPath</ b> convertor</b></p>
<p> The convertor ...</p>
</div>
<div id='sidebar'>
<h2>Content</h2>
<ul>
<li>Header
<ul class='c1'>
<li><a href='#'>Item </a></li>
<li><a href='#'>Item </a></li>
<li>Subheader
<ul class='c2'>
<li><a href='#'>Item </a></li>
<li><a href='#'>Item </a></li>
<li>SubSubheader
<ul class='c3'>
<li><a href='#'>Item </a></li>
<li><a href='#'>Item </a></li>
</ul>
</li>
</ul>
</li>
</ul>
</li>
<ul>
</ul></ul></div>
<div class='has-text content'>
<p class='p1'>Css to XPath convertor</p>
<p>convertor</p>
<p>...</p>
</div>
</main>
<ul>
<li class="noted">Diego</li>
<li>Shilpa</li>
<li class="noted">Caterina</li>
<li>Jayla</li>
<li>Tyrone</li>
<li>Ricardo</li>
<li class="noted"><span>Gila</span></li>
<li>Sienna</li>
<li>Titilayo</li>
<li class="noted">Lexi</li>
<li><span>Aylin</span></li>
<li>Leo</li>
<li>Leyla</li>
<li class="noted"><span>Bruce</span></li>
<li>Aisha</li>
<li>Veronica</li>
<li class="noted">Kyouko</li>
<li>Shireen</li>
<li><span>Tanya</span></li>
<li class="noted">Marlene</li>
</ul>
<div>
<p class='noted'>1.</p>
<p>2.</p>
<p class='noted'>3.</p>
<p> 4.</p>
<p class='noted'>5.</p>
<p class='noted'>6.</p>
<p>7.</p>
<p>8.</p>
<p class='noted'>9.</p>
<p class='noted'>10.</p>
</div>
<div>
<p class='non-escaped'>non-escaped.</p>
<p class='1escaped'>escaped.</p>
<p class="es'cap'ed">escaped.</p>
<p class='es"cap"ed'>escaped.</p>
<p class='#escaped'>escaped.</p>
<p class='#escaped-2'>escaped.</p>
<p class='es{cap}ed'>escaped.</p>
<p id='non-escaped'>non-escaped.</p>
<p id='1escaped'>escaped.</p>
<p id="es'cap'ed">escaped.</p>
<p id='es"cap"ed'>escaped.</p>
<p id='#escaped'>escaped.</p>
<p id='#escaped-2'>escaped.</p>
<p id='es{cap}ed'>escaped.</p>
</div>
<div>
<p class='p2 d'>2.</p>
<p class='p2'>2.</p>
<p class='dp2'>2.</p>
<p class='dp2d'>2.</p>
<p class='p2d'>2.</p>
<p class='p2-d'>2.</p>
<p class='p2'>2.</p>
</div>
<a name=test>Test name</a>
<ol>
<li>Saturn</li>
<li>
<ul>
<li>Mimas</li>
<li>Enceladus</li>
<li>
<ol class='c1'>
<li>Voyager</li>
<li>Cassini</li>
</ol>
</li>
<li>Tethys</li>
</ul>
</li>
<li>Uranus</li>
<li>
<ol>
<li>Titania</li>
<li>Oberon</li>
</ol>
</li>
</ol>
<a href=test>Test href</a>
<article>
<div>div 0.</div>
<div class='Div'>div 1.</div>
<p class='P1'>p 1</ p>
<div class='div'>div 2.</div>
<div class='DiV Parent'>div 3.
<p class='P2'>p 1</p>
<i class='I1'>i 1.</i>
<em class='Emphasize'>em 1.</em>
<em class='Emphasize'>em 2.</em>
<div class='last-child'>div 4.</div>
<div class='diV4 last-child'>div 4.</div>
<div class='last'>div 5.</div>
<div class='diV5 last'>div 5.</div>
</div>
</article>
<article>
<div class='div1'>div 1.</div>
<p class='p1'>p 1</ p>
<div class='div2'>div 2.</div>
<div class='div3'>div 3.
<p class='p2'>p 1</p>
<i class='i1'>i 1.</i>
<em class='em1'>em 1.</em>
<em class='em2'>em 2.</em>
<div class='div4'>div 2.</div>
</div>
<section first>section 1.
<i class='i2'>i 1.</i>
<p class='p3'>p 1</p>
<em class='em3'>em 1.</em>
<p class='p4'>p 1</p>
<em class='em4'>em 2.</em>
<div class='div5'>div 2.</div>
</section>
</article>
<meta charset='utf-8'>
<title>Test</title>
<link rel='stylesheet' href='style.css'>
<body lang='EN-US En-gb en-au en-nz'>
<main id='main'>
<div id='sidebar'>
<h2>Content</h2>
</div>
<div id='header'>
<h1>Test</h1>
</div>
<div class='has-text content'>
<p id='p1'>Css to XPath convertor</p>
<p id='p2'><b>Css</b> to <b>XPath</b> convertor</p>
<p id='p3'>Css to XPath <b>convertor</b></p>
</div>
<div id='lists'>
<div class='nested'>
<h3>Number  list</h3>
<ul id='list'>
<li class='c1' title='Item One'><b>1</b></li>
<li class='c2' title='Item Two'><b>2</b></li>
<li class='c3'><b>3</b></li>
<li class='c4'><b>4</b></li>
<li class='c5'><b>5</b></li>
<li class='c6'><b>6</b></li>
<li class='c7'><b>7</b></li>
</ul>
<ul class='list2'>
<li class='c21' title='Item Twenty One'>21</li>
<li class='c22' title='Item Twenty Two'>22</li>
</ul>
</div>
</div>
<div id='empty'></div>
</main>
</body>
</body>
</html>`,
"CssW3CSelector": `
<!DOCTYPE html>
<html lang='en'>
<head>
<meta charset='utf-8'>
<title>Te</title>
</head>
<body lang='EN-US'>
<ul>
<li>Th</li>
<li>Th</li>
</ul>
<p>Th</p>
<address>Th</address>
<p>
<span class="t1">Th</span>
</p>
<ul>
<li class="t1">Th</li>
</ul>
<foo>An</foo>
<p>
<span class="t1">Th</span>
</p>
<ul>
<li class="t1">Th</li>
</ul>
<p id="foo">Th</p>
<p title="title">Th</p>
<address title="foo">
<span title="b">Th</span>
<span title="aa">ha</span>
</address>
<p class="a b c">Th</p>
<address title="tot foo bar">
<span class="a c">Th</span>
<span class="a bb c">ha</span>
</address>
<p lang="en-gb">Th</p>
<address lang="fi">
<span lang="en-us">Th</span>
<span lang="en-fr">ha</span>
</address>
<p title="foobar">Th<br><br>
b</p>
<p title="foobar">Th</p>
<p title="foobarufoo">Th</p>
<ul>
<li class="t1">Th</li>
<li class="t2">Th</li>
<li class="t2">
<span class="t33">Th</span>
</li>
</ul>
<p class="t1 t2">Th</p>
<div class="test">Th</div>
<p class="t1">Th</p>
<p class="t1 t2">Th</p>
<p class="t1 t2">Th</p>
<div class="t3">Th</div>
<address class="t4 t5 t6">Th</address>
<p class="t1 t2">Th</p>
<ul>
<li id="t1">Th</li>
<li id="t2">Th</li>
<li id="t3"><span id="t44">Th</span></li>
</ul>
<p id="test">Th</p>
<div id="pass">Th</div>
<p class="warning">Th</p>
<div id="Aone" xml:id="Atwo" title="Athree">Th</div>
<p id="Bone">Th</p>
<p xml:id="Ctwo">Th</p>
<p title="Dthree">Th</p>
<!-- T-->
<p class="test">Th</p>
<p class=".test">Th</p>
<p class="foo">Th</p>
<p class="foo quux">Th</p>
<p class="foo quux">Th</p>
<p class="bar">Th</p>
<p>Th</p>
<p>Th</p>
<div>
<p> T</p>
<div id="test"></div>
</div>
<div>
<p> T</p>
<div id="test1"></div>
<div id="test2"></div>
</div>
<div>
<p> T</p>
<div id="stub"></div>
<div></div>
<div><div><!-- <--><div><div id="test"></div></div></div></div>
</div>
<div>
<div><p id="two">Th</p><p id="three">Th</p><p>Th</p></div>
</div>
<p>Th</p>
<p>Th</p>
<ul>
<li class="red">Th</li>
<li>Se</li>
<li class="red">Th</li>
<li>Fo</li>
<li class="red">Th</li>
<li>Si</li>
</ul>
<ol>
<li>Fi</li>
<li class="red">Th</li>
<li>Th</li>
<li class="red">Th</li>
<li>Fi</li>
<li class="red">Th</li>
</ol>
<div>
<table border="1" class="t1">
<tr class="red">
<td>Gr</td>
<td>1.</td>
<td>1.</td>
</tr>
<tr class="red">
<td>Gr</td>
<td>2.</td>
<td>2.</td>
</tr>
<tr class="red">
<td>Gr</td>
<td>3.</td>
<td>3.</td>
</tr>
<tr class="red">
<td>Gr</td>
<td>4.</td>
<td>4.</td>
</tr>
<tr>
<td>5.</td>
<td>5.</td>
<td>5.</td>
</tr>
<tr>
<td>6.</td>
<td>6.</td>
<td>6.</td>
</tr>
</table>
<table class="t2" border="1">
<tr>
<td class="red">gr</td>
<td>1.</td>
<td>1.</td>
<td class="red">gr</td>
<td>1.</td>
<td>1.</td>
<td class="red">gr</td>
<td>1.</td>
</tr>
<tr>
<td class="red">gr</td>
<td>2.</td>
<td>2.</td>
<td class="red">gr</td>
<td>2.</td>
<td>2.</td>
<td class="red">gr</td>
<td>2.</td>
</tr>
<tr>
<td class="red">gr</td>
<td>3.</td>
<td>3.</td>
<td class="red">gr</td>
<td>3.</td>
<td>3.</td>
<td class="red">gr</td>
<td>3.</td>
</tr>
</table>
</div>
<ul>
<li class="green">Th</li>
<li>Se</li>
<li class="green">Th</li>
<li>Fo</li>
<li class="green">Th</li>
<li>Si</li>
</ul>
<ol>
<li>Fi</li>
<li class="green">Th</li>
<li>Th</li>
<li class="green">Th</li>
<li>Fi</li>
<li class="green">Th</li>
</ol>
<div>
<table border="1" class="t1">
<tr class="green">
<td>Gr</td>
<td>1.</td>
<td>1.</td>
</tr>
<tr class="green">
<td>Gr</td>
<td>2.</td>
<td>2.</td>
</tr>
<tr class="green">
<td>Gr</td>
<td>3.</td>
<td>3.</td>
</tr>
<tr class="green">
<td>Gr</td>
<td>4.</td>
<td>4.</td>
</tr>
<tr>
<td>5.</td>
<td>5.</td>
<td>5.</td>
</tr>
<tr>
<td>6.</td>
<td>6.</td>
<td>6.</td>
</tr>
</table>
<p></p>
<table class="t2" border="1">
<tr>
<td class="green">gr</td>
<td>1.</td>
<td>1.</td>
<td class="green">gr</td>
<td>1.</td>
<td>1.</td>
<td class="green">gr</td>
<td>1.</td>
</tr>
<tr>
<td class="green">gr</td>
<td>2.</td>
<td>2.</td>
<td class="green">gr</td>
<td>2.</td>
<td>2.</td>
<td class="green">gr</td>
<td>2.</td>
</tr>
<tr>
<td class="green">gr</td>
<td>3.</td>
<td>3.</td>
<td class="green">gr</td>
<td>3.</td>
<td>3.</td>
<td class="green">gr</td>
<td>3.</td>
</tr>
</table>
</div>
<p>Th</p>
<address>An</address>
<p>So</p>
<p class="red">Bu</p>
<dl>
<dt class="red">Fi</dt>
<dd class="red">Fi</dd>
<dt>Se</dt>
<dd>Se</dd>
<dt>Th</dt>
<dd>Th</dd>
<dt class="red">Fo</dt>
<dd class="red">Fo</dd>
<dt>Fi</dt>
<dd>Fi</dd>
<dt>Si</dt>
<dd>Si</dd>
</dl>
<p class="red">Th</p>
<address>Bu</address>
<p>So</p>
<p>An</p>
<dl>
<dt>Fi</dt>
<dd>Fi</dd>
<dt>Se</dt>
<dd>Se</dd>
<dt class="red">Th</dt>
<dd class="red">Th</dd>
<dt>Fo</dt>
<dd>Fo</dd>
<dt>Fi</dt>
<dd>Fi</dd>
<dt class="red">Si</dt>
<dd class="red">Si</dd>
</dl>
<div>
<table class="t1" border="1">
<tr>
<td class="red">gr</td>
<td>1.</td>
<td>1.</td>
</tr>
<tr>
<td class="red">gr</td>
<td>2.</td>
<td>2.</td>
</tr>
<tr>
<td class="red">gr</td>
<td>3.</td>
<td>3.</td>
</tr>
</table>
</div>
<p>Th<span>an</span>
</p>
<div>
<table class="t1" border="1">
<tr>
<td>1.</td>
<td>1.</td>
<td class="red">gr</td>
</tr>
<tr>
<td>2.</td>
<td>2.</td>
<td class="red">gr</td>
</tr>
<tr>
<td>3.</td>
<td>3.</td>
<td class="red">gr</td>
</tr>
</table>
</div>
<p>
<span>Th</span> a</p>
<div>Th<address class="red">A </address>
<address>A </address>
<address>A </address>
</div>
<div>
<address>A </address>
<address>A </address>
<address class="red">A </address>
T</div>
<p>Th</p>
<div>Th<p class="red">Th</p>
</div>
<div class="t1">
<p>Th</p>
<address class="red">Bu</address>
<p>Th</p>
</div>
<div class="t1">
<p class="red">Th</p>
<table>
<tbody>
<tr>
<td>
<p class="red">Th</p>
</td>
</tr>
</tbody>
</table>
</div>
<table>
<tbody>
<tr>
<td>
<p class="white">Th</p>
</td>
</tr>
</tbody>
</table>
<div class="t1">
<p class="white">Th</p>
<table>
<tbody>
<tr>
<td>
<p class="white">Th</p>
</td>
</tr>
</tbody>
</table>
</div>
<table>
<tbody>
<tr>
<td>
<p class="green">Th</p>
</td>
</tr>
</tbody>
</table>
<div>
<p class="red test">Th</p>
<div>
<p class="red test">Th</p>
</div>
</div>
<table>
<tbody>
<tr>
<td>
<p class="white test">Th</p>
</td>
</tr>
</tbody>
</table>
<div>
<p class="white test">Th</p>
<div>
<p class="white test">Th</p>
</div>
</div>
<table>
<tbody>
<tr>
<td>
<p class="green test">Th</p>
</td>
</tr>
</tbody>
</table>
<div> T</div>
<div class="control"> T</div>
<div> T</div>
<p> T</p>
<div class="stub">
<p>Th</p>
<p class="red">Bu</p>
<p class="red">An</p>
<address>Th</address>
<p>Th</p>
</div>
<div class="stub">
<p class="green">Th</p>
<p class="white">Bu</p>
<p class="white">An</p>
<address class="green">Th</address>
<p class="green">Th</p>
</div>
<div class="stub">
<p>Th</p>
<p class="red">Bu</p>
<p class="red">An</p>
<address>Th</address>
<p class="red">Th</p>
</div>
<div class="stub">
<p>Th</p>
<p class="green">Bu</p>
<p class="green">An</p>
<address>Th</address>
<p class="green">Th</p>
</div>
<div class="stub">
<p>Th</p>
<p title="on chante?">Th</p>
<p title="si on chantait">
<span title="si il chantait">Th</span>
</p>
</div>
<div class="stub">
<p>Th</p>
<p title="on chante?">Th</p>
<p title="si on chantait">
<span title="si il chante">Th</span>
</p>
</div>
<div class="stub">
<p>Th</p>
<p class="bar foofoo tut">Th</p>
<p class="bar foo tut">
<span class="tut foo2">Th</span>
</p>
</div>
<div class="stub">
<p>Th</p>
<p id="foo2">Th</p>
<p id="foo">
<span>Th</span>
</p>
</div>
<ul>
<li>Fi</li>
<li class="red">Th</li>
<li>Th</li>
<li class="red">Th</li>
<li>Fi</li>
<li class="red">Th</li>
</ul>
<ol>
<li class="red">Th</li>
<li>Se</li>
<li class="red">Th</li>
<li>Fo</li>
<li class="red">Th</li>
<li>Si</li>
</ol>
<div>
<table border="1" class="t1">
<tr>
<td>1.</td>
<td>1.</td>
<td>1.</td>
</tr>
<tr>
<td>2.</td>
<td>2.</td>
<td>2.</td>
</tr>
<tr>
<td>3.</td>
<td>3.</td>
<td>3.</td>
</tr>
<tr>
<td>4.</td>
<td>4.</td>
<td>4.</td>
</tr>
<tr class="red">
<td>Gr</td>
<td>5.</td>
<td>5.</td>
</tr>
<tr class="red">
<td>Gr</td>
<td>6.</td>
<td>6.</td>
</tr>
</table>
<p></p>
<table class="t2" border="1">
<tr>
<td>1.</td>
<td class="red">gr</td>
<td class="red">gr</td>
<td>1.</td>
<td class="red">gr</td>
<td class="red">gr</td>
<td>1.</td>
<td class="red">gr</td>
</tr>
<tr>
<td>2.</td>
<td class="red">gr</td>
<td class="red">gr</td>
<td>2.</td>
<td class="red">gr</td>
<td class="red">gr</td>
<td>2.</td>
<td class="red">gr</td>
</tr>
<tr>
<td>3.</td>
<td class="red">gr</td>
<td class="red">gr</td>
<td>3.</td>
<td class="red">gr</td>
<td class="red">gr</td>
<td>3.</td>
<td class="red">gr</td>
</tr>
</table>
</div>
<ul>
<li>Fi</li>
<li class="green">Th</li>
<li>Th</li>
<li class="green">Th</li>
<li>Fi</li>
<li class="green">Th</li>
</ul>
<ol>
<li class="green">Th</li>
<li>Se</li>
<li class="green">Th</li>
<li>Fo</li>
<li class="green">Th</li>
<li>Si</li>
</ol>
<div>
<table border="1" class="t1">
<tr>
<td>1.</td>
<td>1.</td>
<td>1.</td>
</tr>
<tr>
<td>2.</td>
<td>2.</td>
<td>2.</td>
</tr>
<tr>
<td>3.</td>
<td>3.</td>
<td>3.</td>
</tr>
<tr>
<td>4.</td>
<td>4.</td>
<td>4.</td>
</tr>
<tr class="green">
<td>Gr</td>
<td>5.</td>
<td>5.</td>
</tr>
<tr class="green">
<td>Gr</td>
<td>6.</td>
<td>6.</td>
</tr>
</table>
<p></p>
<table class="t2" border="1">
<tr>
<td>1.</td>
<td class="green">gr</td>
<td class="green">gr</td>
<td>1.</td>
<td class="green">gr</td>
<td class="green">gr</td>
<td>1.</td>
<td class="green">gr</td>
</tr>
<tr>
<td>2.</td>
<td class="green">gr</td>
<td class="green">gr</td>
<td>2.</td>
<td class="green">gr</td>
<td class="green">gr</td>
<td>2.</td>
<td class="green">gr</td>
</tr>
<tr>
<td>3.</td>
<td class="green">gr</td>
<td class="green">gr</td>
<td>3.</td>
<td class="green">gr</td>
<td class="green">gr</td>
<td>3.</td>
<td class="green">gr</td>
</tr>
</table>
</div>
<p class="red">Th</p>
<address>An</address>
<p class="red">Th</p>
<p>Bu</p>
<dl>
<dt>Fi</dt>
<dd>Fi</dd>
<dt class="red">Se</dt>
<dd class="red">Se</dd>
<dt class="red">Th</dt>
<dd class="red">Th</dd>
<dt>Fo</dt>
<dd>Fo</dd>
<dt class="red">Fi</dt>
<dd class="red">Fi</dd>
<dt class="red">Si</dt>
<dd class="red">Si</dd>
</dl>
<div>
<table class="t1" border="1">
<tr>
<td>1.</td>
<td class="red">gr</td>
<td class="red">gr</td>
</tr>
<tr>
<td>2.</td>
<td class="red">gr</td>
<td class="red">gr</td>
</tr>
<tr>
<td>3.</td>
<td class="red">gr</td>
<td class="red">gr</td>
</tr>
</table>
</div>
<p>Th<span>sh</span> u</p>
<div>
<table class="t1" border="1">
<tr>
<td>1.</td>
<td class="green">gr</td>
<td class="green">gr</td>
</tr>
<tr>
<td>2.</td>
<td class="green">gr</td>
<td class="green">gr</td>
</tr>
<tr>
<td>3.</td>
<td class="green">gr</td>
<td class="green">gr</td>
</tr>
</table>
</div>
<p>Th<span>sh</span> u</p>
<div>
<table class="t1" border="1">
<tr>
<td class="red">gr</td>
<td class="red">gr</td>
<td>1.</td>
</tr>
<tr>
<td class="red">gr</td>
<td class="red">gr</td>
<td>2.</td>
</tr>
<tr>
<td class="red">gr</td>
<td class="red">gr</td>
<td>3.</td>
</tr>
</table>
</div>
<p>Th<span>pa</span> b</p>
<div>
<table class="t1" border="1">
<tr>
<td class="green">gr</td>
<td class="green">gr</td>
<td>1.</td>
</tr>
<tr>
<td class="green">gr</td>
<td class="green">gr</td>
<td>2.</td>
</tr>
<tr>
<td class="green">gr</td>
<td class="green">gr</td>
<td>3.</td>
</tr>
</table>
</div>
<p>Th<span>pa</span> b</p>
<div>Th<address>A </address>
<address class="red">A </address>
<address class="red">A </address>
</div>
<div>
<address class="red">A </address>
<address class="red">A </address>
<address>A </address>
</div>
<p class="red">Th</p>
<div>Th<p>Th</p>
</div>
<p class="green">Th</p>
<div>Th<p>Th</p>
</div>
<main>
<div>I </div>
<p>I </p>
<div>I </div>
<div>I <i>I </i>
<i name>I </i>
<em>I </em>
<em>I </em>
</div>
</main>
<div class="t1">
<p class="red">Th</p>
<address>Bu</address>
<p class="red">Th</p>
</div>
<p>Th</p>
<blockquote>
<div>
<div>
<p>Th</p>
</div>
</div>
</blockquote>
<blockquote><div>Th</div></blockquote>
<div>Th</div>
<div>Th</div>
<p>Th</p>
<blockquote><div>Th</div></blockquote>
<div>
<div>
<p>Th</p>
</div>
</div>
<p html:lang="en-us">Th</p>
<q foo="bargain-trash">Th</q>
<r foo="bar-drink-glass">Th</r>
<s foo="bar-drink-glass">Th</s>
<p title="si on chantait">Th</p>
<q title="et si on chantait">Th</q>
<r title="si on chantait">Th</r>
<s b:title="si on chantait">Th</s>
<p title="si on chantait">Th</p>
<q title="si nous chantions">Th</q>
<r title="si on chantait">Th</r>
<s b:title="si on chantait">Th</s>
<p title="si on chantait">Th</p>
<q title="si nous chantions">Th</q>
<r title="si on chantait">Th</r>
<s b:title="si on chantait">Th</s>
<p title="si on chantait">Th</p>
<q foo="si on chantait">Th</q>
<r title="si on chantait">Th</r>
<s b:title="si on chantait">Th</s>
<p title="si on chantait">Th</p>
<q foo="si on chantait">Th</q>
<q title="si nous chantions">Th</q>
<r title="si on chantait">Th</r>
<s b:title="si on chantait">Th</s>
<p class="un deux trois">Th</p>
<q a:bar="un deux trois">Th</q>
<q foo="un second deuxieme trois">Th</q>
<r foo="un deux trois">Th</r>
<s foo="un deux trois">Th</s>
<p lang="en-us">Th</p>
<q foo="un-deux-trois">Th</q>
<q foo="un-second-deuxieme-trois">Th</q>
<r foo="un-d-trois">Th</r>
<s foo="un-d-trois">Th</s>
<p title="si on chantait">Th</p>
<q title="si nous chantions">Th</q>
<r title="si on chantait">Th</r>
<s b:title="si on chantait">Th</s>
<t b:ti="si on chantait">Th</t>
<p title="si on chantait">Th</p>
<q title="si on chantait">Th</q>
<r title="si on chantait">Th</r>
<p title="si on chantait">Th</p>
<q title="si on chantait">Th</q>
<r title="si on chantait">Th</r>
<s b:title="si on chantait">Th</s>
<t title="si nous chantions">Th</t>
<p class="bar foo toto">Th</p>
<address class="bar foofoo toto">Th</address>
<q class="bar foo toto">Th</q>
<r b:class="bar foo toto">Th</r>
<p lang="foo-bar">Th</p>
<address lang="foo-b">Th</address>
<address lang="foo-barbar-toto">Th</address>
<q myattr="tat-tut-tot">Th</q>
<r b:myattr="tat-tut-tot">Th</r>
<p title="si on chantait">Th</p>
<q title="si nous chantions">Th</q>
<r title="si on chantait">Th</r>
<s b:title="si on chantait">Th</s>
<t b:ti="si on chantait">Th</t>
<p title="si on chantait">Th</p>
<q title="si nous chantions">Th</q>
<r title="si on chantait">Th</r>
<s b:title="si on chantait">Th</s>
<t title="si nous chantions">Th</t>
<div class="test">
<p>Th</p>
<p>Th</p>
<p xmlns="">Th</p>
<p>
<l>Th</l>
</p>
</div>
<div class="test">
<div class="stub">
<p>Th</p>
<p>Th</p>
<p xmlns="">Th</p>
<p>Th</p>
</div>
<address>Th</address>
<s>Th</s>
<t xmlns="">Th</t>
<u>Th</u>
</div>
<div class="stub">
<p>Th</p>
<p>Th</p>
<l>
<p xmlns="">Th</p>
</l>
<p>Th</p>
</div>
<div class="stub">
<address>Th</address>
<s>Th</s>
<t xmlns="">Th</t>
<u>
<v>Th</v>
</u>
</div>
<div class="stub">
<address>Th</address>
<s>Th</s>
<t xmlns="">Th</t>
<u>Th</u>
</div>
<div class="stub">
<address>Th</address>
<s>Th</s>
<u>Th</u>
</div>
<div class="stub">
<t xmlns="">Th</t>
</div>
<div class="stub">
<p title="foo">Th</p>
<q title="foo">Th</q>
<s title="foobar">Th</s>
<r b:title="foo">Th</r>
</div>
<div class="stub">
<q foo="hgt bardot f">Th</q>
<r foo="hgt bar f">Th</r>
<s foo="hgt bar f">Th</s>
</div>
<div class="stub">
<q foo="bargain-trash">Th</q>
<r foo="bar-drink-glass">Th</r>
<s foo="bar-drink-glass">Th</s>
</div>
<div class="stub">
<q title="et si on chantait">Th</q>
<r title="si on chantait">Th</r>
<s b:title="si on chantait">Th</s>
</div>
<div class="stub">
<q title="si nous chantions">Th</q>
<r title="si on chantait">Th</r>
<s b:title="si on chantait">Th</s>
</div>
<div class="stub">
<q foo="si on chantait">Th</q>
<r title="si on chantait">Th</r>
<s b:title="si on chantait">Th</s>
</div>
<div class="stub">
<q foo="si on chantait">Th</q>
<q title="si nous chantions">Th</q>
<r title="si on chantait">Th</r>
<s b:title="si on chantait">Th</s>
</div>
<div class="stub">
<p class="un deux trois">Th</p>
<p class="un deu trois">Th</p>
<q a:bar="un deux trois">Th</q>
<q foo="un second deuxieme trois">Th</q>
<r foo="un deux trois">Th</r>
<s foo="un deux trois">Th</s>
</div>
<div class="stub">
<p lang="en-us">Th</p>
<p lang="fr" class="foo">Th</p>
<q foo="un-deux-trois">Th</q>
<q foo="un-second-deuxieme-trois">Th</q>
<r foo="un-d-trois">Th</r>
<s foo="un-d-trois">Th</s>
</div>
<div class="stub">
<p title="si on chantait">Th</p>
<p title="si il chantait" class="red">Th</p>
<q title="si nous chantions">Th</q>
<r title="si on chantait">Th</r>
<s b:title="si on chantait">Th</s>
<t b:ti="si on chantait">Th</t>
</div>
<div class="stub">
<p title="si on chantait">Th</p>
<p title="si tu chantais" class="red">Th</p>
<q title="si nous chantions">Th</q>
<r title="si on chantait">Th</r>
<s b:title="si on chantait">Th</s>
<t b:ti="si on chantait">Th</t>
</div>
<div class="stub">
<q title="si on chantait">Th</q>
<r title="si on chantait">Th</r>
</div>
<div class="stub">
<q title="si on chantait">Th</q>
<r title="si on chantait">Th</r>
<s b:title="si on chantait">Th</s>
<t title="si nous chantions">Th</t>
</div>
<div class="stub">
<p class="bar foo toto">Th</p>
<address class="bar foofoo toto">Th</address>
<q class="bar foo toto">Th</q>
<r b:class="bar foo toto">Th</r>
</div>
<div class="stub">
<p lang="foo-bar">Th</p>
<address lang="foo-b">Th</address>
<address lang="foo-barbar-toto">Th</address>
<q lang="foo-bar">Th</q>
<r b:lang="foo-bar">Th</r>
</div>
<test xmlns="http://www.example.org/">
<line type="odd">Th</line>
<line type="even">Th</line>
<line type="odd" hidden="hidden">Th</line>
<line type="even">Th</line>
<line type="odd">Th</line>
<line type="even">Th</line>
<line type="odd">Th</line>
<line type="even" hidden="hidden">Th</line>
<line type="odd">Th</line>
<line type="even">Th</line>
<line type="odd">Th</line>
<line type="even" hidden="hidden">Th</line>
<line type="odd" hidden="hidden">Th</line>
<line type="even">Th</line>
<line type="odd">Th</line>
</test>
<test xmlns="http://www.example.org/">
<line type="">Th</line>
<line type="match">Th</line>
<line type="">Th</line>
<line type="">Th</line>
<line type="match">Th</line>
<line type="">Th</line>
<line type="" hidden="hidden">Th</line>
<line type="match">Th</line>
<line type="">Th</line>
<line type="">Th</line>
<line type="match">Th</line>
<line type="">Th</line>
<line type="" hidden="hidden">Th</line>
<line type="match" hidden="hidden">Th</line>
<line type="">Th</line>
<line type="">Th</line>
<line type="match">Th</line>
<line type="">Th</line>
<line type="">Th</line>
<line type="match">Th</line>
<line type="">Th</line>
</test>
<p>Th</p>
<address></address>
<div class="text">Th</div>
<address><!-- --></address>
<div class="text">Th</div>
<p>(N</p>
<address> </address>
<div class="text">Th</div>
<address><span></span></address>
<div class="text">Th</div>
<address xmlns="http://tests.example.org/xml-only/"></address>
<div class="text">Th</div>
<p>(N</p>
<p class="5cm">Th</p>
<p class="one.word">Th</p>
<div xmlns="http://www.w3.org/2000/xmlns/">
<p attribute="pass">Th</p>
</div>
<div>
<p attribute="pass">Th</p>
</div>
<div xmlns="http://www.w3.org/2000/xmlns/" xmlns:ns="http://www.w3.org/2000/xmlns/">
<ns:p ns:attribute="pass">Th</ns:p>
<p attribute="pass">Th</p>
</div>
<div>
<p attribute="pass">Th</p>
</div>
<p id="id" class="class test">Th</p>
<div id="theid" class="class test">Th</div>
<p xmlns="http://www.w3.org/1999/xhtml">Th</p>
<address xmlns="http://www.w3.org/1999/xhtml">Th</address>
<p xmlns="http://www.w3.org/1999/xhtml" class="red">Th</p>
<p xmlns="http://www.w3.org/1999/xhtml" class="red">Th</p>
<dl xmlns="http://www.w3.org/1999/xhtml">
<dt class="red">Fi</dt>
<dd class="red">Fi</dd>
<dt class="red">Se</dt>
<dd class="red">Se</dd>
<dt>Th</dt>
<dd>Th</dd>
<dt class="red">Fo</dt>
<dd class="red">Fo</dd>
<dt class="red">Fi</dt>
<dd class="red">Fi</dd>
<dt>Si</dt>
<dd>Si</dd>
</dl>
<p xmlns="http://www.w3.org/1999/xhtml">Th</p>
<address xmlns="http://www.w3.org/1999/xhtml">Th</address>
<p xmlns="http://www.w3.org/1999/xhtml" class="green">Th</p>
<p xmlns="http://www.w3.org/1999/xhtml" class="green">Th</p>
<dl xmlns="http://www.w3.org/1999/xhtml">
<dt class="green">Fi</dt>
<dd class="green">Fi</dd>
<dt class="green">Se</dt>
<dd class="green">Se</dd>
<dt>Th</dt>
<dd>Th</dd>
<dt class="green">Fo</dt>
<dd class="green">Fo</dd>
<dt class="green">Fi</dt>
<dd class="green">Fi</dd>
<dt>Si</dt>
<dd>Si</dd>
</dl>
<test xmlns="http://www.example.org/">
<line type="">Th</line>
<line type="match">Th</line>
<line type="">Th</line>
<line type="">Th</line>
<line type="match">Th</line>
<line type="">Th</line>
<line type="">Th</line>
<line type="match" hidden="hidden">Th</line>
<line type="" hidden="hidden">Th</line>
<line type="">Th</line>
<line type="match">Th</line>
<line type="">Th</line>
<line type="">Th</line>
<line type="match">Th</line>
<line type="" hidden="hidden">Th</line>
<line type="">Th</line>
<line type="match">Th</line>
<line type="">Th</line>
<line type="">Th</line>
<line type="match">Th</line>
<line type="">Th</line>
</test>
</body>
</html>`,
"not-nth": `<!DOCTYPE html>
<html>
<head>
</head>
<body>

<div>
	<p class='c1'>1.</p>
	<h2>h2.</h2>
	<p class='c2'>2.</p>
	<p class='c3'>3.</p>
	<h2>h2.</h2>
	<p class='c4'>4</p>
	<p class='c5'>5</p>
	<p class='c6'>6</p>
</div>

<div id=div1>
	<p>The first p.</p>
	<p>The second p.</p>
	<p class=nth>The third p.</p>
	<p>The fourth p.</p>

	<p>The first p.</p>
	<p class=nth>The sixth p.</p>
	<p>The seventh p.</p>
	<p>The eighth p.</p>

	<p>The ninth p.</p>
	<!-- <p>The tenth p.</p> -->
</div>
<hr>

<div id=first>
	<p>The first p.</p>
	<p>The second p.</p>
	<p class=nth>The third p.</p>
	<p>The fourth p.</p>

	<p>The first p.</p>
	<p class=nth>The sixth p.</p>
	<p>The seventh p.</p>
	<p>The eighth p.</p>

	<p>The ninth p.</p>
	<p>The tenth p.</p>
	<p>The eleventh p.</p>
	<p>The twelfth p.</p>

    <p class='c4'>4</p>
	<p class='c5'>5</p>
	<p class='c6'>6</p>
</div>

<hr>

<div id=second>
    <p>The first p.</p>
	<p>The second p.</p>
	<p>The third p.</p>
	<p>The fourth p.</p>

	<p>The first p.</p>
	<p>The sixth p.</p>
	<p>The seventh p.</p>
	<p>The eighth p.</p>
	<b>The B element.</b>

	<p>The ninth p.</p>
	<p>The tenth p.</p>
	<p>The eleventh p.</p>
	<p>The twelfth p.</p>

	<p>The 1 p.</p>
	<b>The B element.</b>
	<p>The 2 p.</p>
	<p>The 3 p.</p>
	<b>The B element.</b>
	<b>The B element.</b>
</div>

<div id=third>
	<p>The 1 p.</p>
	<b>The B element.</b>
	<p>The 2 p.</p>
	<p>The 3 p.</p>
	<b>The B element.</b>
	<b>The B element.</b>
	<b>The B element.</b>
</div>

</body>
</html>`,
"nth-child-of-selector": `<!DOCTYPE html>
<html>
<head>
</head>
<body>
<div>
	<ul>
		<li class="c1 c2">peacock</li>
		<li>marten</li>
		<li>basilisk</li>
		<li class="c1 c2">buzzard</li>
		<li>reptile</li>
		<li>crane</li>
		<li>mammal</li>
		<li class="c2 c1">platypus</li>
		<li>hedgehog</li>
		<li class="c1">gibbon</li>
		<li class="c1 c2">wildebeest</li>
		<li>crab</li>
		<li>porcupine</li>
		<li>goldfish</li>
		<li class="c1 c2">owl</li>
		<li>chickadee</li>
		<li>gopher</li>
		<li class="c1 c2">puma</li>
		<li>goat</li>
		<li>unicorn</li>
		<li>limpet</li>
		<li>chameleon</li>
		<li class="c1 c2">pelican</li>
		<li>gamefowl</li>
		<li>possum</li>
		<li>crocodile</li>
		<li class="c2 c1">cricket</li>
		<li>lemming</li>
		<li>chinchilla</li>
		<li class="c1">spoonbill</li>
		<li>bee</li>
		<li>leech</li>
		<li>elephant</li>
		<li class="c2 c1">haddock</li>
		<li>termite</li>
		<li>squirrel</li>
		<li>badger</li>
		<li>stoat</li>
		<li>anglerfish</li>
		<li>camel</li>
		<li class="c2 c1">coral</li>
		<li>ostrich</li>
		<li>hookworm</li>
		<li>prawn</li>
		<li>chicken</li>
		<li>mackerel</li>
		<li class="c1 c2">meerkat</li>
		<li>iguana</li>
		<li>worm</li>
		<li>reindeer</li>
		<li>cod</li>
		<li class="c1 c2">caterpillar</li>
		<li>bison</li>
		<li>tahr</li>
		<li class="c1 c2">hummingbird</li>
		<li>ape</li>
		<li class="c1 c2">parrotfish</li>
	</ul>
	<div>
		<p class='c1'>1</p>
		<p>2</p>
		<p class='c2'>3</p>
		<p class='c1 c2'>4</p>
		<p>5</p>
		<p class='c2 c1'>6</p>
		<p class='c2'>7</p>
		<p class='c2 c1'>8</p>
		<p>9</p>
		<p class='c1 c2'>10</p>
	</div>
	<div>
		<p>2</p>
		<p class='c2'>14</p>
		<p class='c1'>1</p>
		<p class='c1 c2'>4</p>
		<p class='c2'>3</p>
		<p>5</p>
		<p class='c2 c1'>6</p>
		<p class='c1'>12</p>
		<p class='c2'>7</p>
		<p class='c2 c1'>8</p>
		<p>9</p>
		<p class='c1 c2'>10</p>
		<p class='c1'>11</p>
		<p class='c2'>13</p>
	</div>
</div>
</body>
</html>`,
"nth": `<!DOCTYPE html>
<html>
<head>
</head>
<body>

<div>
	<p class='c1'>1.</p>
	<h2>h2.</h2>
	<p class='c2'>2.</p>
	<p class='c3'>3.</p>
	<h2>h2.</h2>
	<p class='c4'>4</p>
	<p class='c5'>5</p>
	<p class='c6'>6</p>
</div>

<div id=div1>
	<p>The first p.</p>
	<p>The second p.</p>
	<p class=nth>The third p.</p>
	<p>The fourth p.</p>

	<p>The first p.</p>
	<p class=nth>The sixth p.</p>
	<p>The seventh p.</p>
	<p>The eighth p.</p>

	<p>The ninth p.</p>
	<!-- <p>The tenth p.</p> -->
</div>
<hr>

<div id=first>
	<p>The first p.</p>
	<p>The second p.</p>
	<p class=nth>The third p.</p>
	<p>The fourth p.</p>

	<p>The first p.</p>
	<p class=nth>The sixth p.</p>
	<p>The seventh p.</p>
	<p>The eighth p.</p>

	<p>The ninth p.</p>
	<p>The tenth p.</p>
	<p>The eleventh p.</p>
	<p>The twelfth p.</p>

    <p class='c4'>4</p>
	<p class='c5'>5</p>
	<p class='c6'>6</p>
</div>

<hr>

<div id=second>
    <p>The first p.</p>
	<p>The second p.</p>
	<p>The third p.</p>
	<p>The fourth p.</p>

	<p>The first p.</p>
	<p>The sixth p.</p>
	<p>The seventh p.</p>
	<p>The eighth p.</p>
	<b>The B element.</b>

	<p>The ninth p.</p>
	<p>The tenth p.</p>
	<p>The eleventh p.</p>
	<p>The twelfth p.</p>

	<p>The 1 p.</p>
	<b>The B element.</b>
	<p>The 2 p.</p>
	<p>The 3 p.</p>
	<b>The B element.</b>
	<b>The B element.</b>
</div>

<div id=third>
	<p>The 1 p.</p>
	<b>The B element.</b>
	<p>The 2 p.</p>
	<p>The 3 p.</p>
	<b>The B element.</b>
	<b>The B element.</b>
	<b>The B element.</b>
</div>

</body>
</html>`,
};
