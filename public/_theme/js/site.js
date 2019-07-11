(() => {
  'use strict';

  const navLists = document.querySelectorAll('.js-nav-list');
  let navListsHeights = [];
  let navListItems;
  let navListItemHeight;
  let navLink;

  // calculate list height and set height on initial list
  for (let i = 0; i < navLists.length; i++) {
    // get all list items and reset height
    navListItems = navLists[i].querySelectorAll('li');
    navListItemHeight = 0;

    // get height of all list items
    for (let x = 0; x < navListItems.length; x++) {
      navListItemHeight += navListItems[x].offsetHeight;
      navListsHeights[i] = navListItemHeight;
    }

    // set initial active list height
    if (navLists[i].classList.contains('active')) {
      navLists[i].style.transition = 'none';
      navLists[i].style.maxHeight = `${navListsHeights[i]}px`;
    }

    // setup toggle events
    navLink = navLists[i].firstElementChild.firstElementChild;
    navLink.addEventListener('click', (e) => toggleNav(e, navLists, navListsHeights));
    navLink.addEventListener('touchend', (e) => toggleNav(e, navLists, navListsHeights));
  }


  const toggleNav = (e, navLists, navListsHeights) => {
    let thisTarget = e.target;
    let thisIndex;

    // find this nav-list
    while ((thisTarget = thisTarget.parentNode) && (thisTarget.tagName !== 'OL'));

    for (let i = 0; i < navLists.length; i++) {
      // if transition disabled on load, re-enable
      if (navLists[i].style.transition) {
        navLists[i].style.transition = null;
      }

      // make other elements inactive
      navLists[i].classList.remove('active');
      navLists[i].style.maxHeight = null;

      // check if list matches active target
      if (navLists[i] === thisTarget) {
        thisIndex = i;
      }
    }

    // make current element active
    thisTarget.style.maxHeight = `${navListsHeights[thisIndex]}px`;
    thisTarget.classList.add('active');
  }
})();

(() => {
  'use strict'

  var toolbar = document.querySelector('.toolbar')

  function querySect1 (el) {
    if (el.className === 'sect1') {
      return el
    }
    else if (el.nodeName !== 'ARTICLE') {
      return querySect1(el.parentNode)
    }
  }

  function queryStickyHeading (from) {
    var sect1 = querySect1(from)
    if (sect1) {
      return sect1.firstElementChild
    }
  }

  function isStickyHeading (candidate) {
    return candidate.nodeName === 'H2' && candidate.parentNode.className === 'sect1'
  }

  function jumpToAnchor (e) {
    if (e) {
      window.location.hash = '#' + this.id
      e.preventDefault()
    }
    var stickyHeading = queryStickyHeading(this)
    window.scrollTo(0, this.offsetTop - toolbar.offsetHeight - (stickyHeading ? stickyHeading.offsetHeight : 0))
  }

  function jumpToStickyHeading (e) {
    if (e) {
      window.location.hash = '#' + this.id
      e.preventDefault()
    }
    window.scrollTo(0, document.documentElement.scrollTop = this.parentNode.offsetTop - toolbar.offsetHeight)
  }

  window.addEventListener('load', function jumpOnLoad (hash, target) {
    if ((hash = window.location.hash) && (target = document.getElementById(hash.slice(1)))) {
      isStickyHeading(target) ? jumpToStickyHeading.bind(target)() : jumpToAnchor.bind(target)()
    }
    window.removeEventListener('load', jumpOnLoad)
  })

  Array.prototype.slice.call(document.querySelectorAll('.doc a[href^="#"]')).forEach(function (a) {
    var target = document.getElementById(a.hash.slice(1))
    if (target) {
      a.addEventListener('click', isStickyHeading(target) ? jumpToStickyHeading.bind(target) : jumpToAnchor.bind(target))
    }
  })
})();

(() => {
  'use strict';

  const toggles = document.querySelectorAll('.js-version');
  for (let i = 0; i < toggles.length; i++) {
    toggles[i].addEventListener('click', (e) => e.stopPropagation());
    toggles[i].addEventListener('change', (e) => window.location.href = e.target.value);
  };
})();

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    var doc = document.querySelector('.doc');

    if (!doc) return;
    var sidebar = document.querySelector('.js-toc');
    var menu;

    var headings = find('.sect1 > h2[id]', doc);
    var subheadings = find('.sect1 > h3[id]', doc);

    if (!headings.length) {
      if (sidebar) {
        sidebar.parentNode.removeChild(sidebar);
        document.querySelector('.main').classList.add('no-sidebar');
      }
      return;
    }

    var lastActiveFragment;
    var links = {};

    var list = headings.reduce(function(accum, heading) {
      var link = toArray(heading.childNodes).reduce(function(target, child) {
        if (child.nodeName !== 'A') target.appendChild(child.cloneNode(true));
        return target;
      }, document.createElement('a'));
      links[(link.href = '#' + heading.id)] = link;
      var listItem = document.createElement('li');
      listItem.appendChild(link);
      // Append subitems to listItem
      // var sublink = document.createElement('a'); // A
      // listItem.appendChild(sublink);

      accum.appendChild(listItem);
      return accum;
    }, document.createElement('ol'));

    if (!(menu = sidebar && sidebar.querySelector('.toc-menu'))) {
      menu = document.createElement('div');
      menu.className = 'toc-menu';
    }

    menu.appendChild(list);

    if (sidebar) window.addEventListener('scroll', onScroll);

    var startOfContent = doc.querySelector('h1.page + *');
    if (startOfContent) {
      // generate list
      var options = headings.reduce(function(accum, heading) {
        var option = toArray(heading.childNodes).reduce(function(
          target,
          child
        ) {
          if (child.nodeName !== 'A') target.appendChild(child.cloneNode(true));
          return target;
        },
        document.createElement('option'));
        option.value = '#' + heading.id;
        accum.appendChild(option);
        return accum;
      }, document.createElement('select'));

      var selectWrap = document.createElement('div');
      selectWrap.classList.add('select-wrapper');
      selectWrap.appendChild(options);

      // create jump to label
      var jumpTo = document.createElement('option');
      jumpTo.innerHTML = 'Jump to…';
      jumpTo.setAttribute('disabled', true);
      options.insertBefore(jumpTo, options.firstChild);
      options.className = 'toc toc-embedded select';

      // jump on change
      options.addEventListener('change', function(e) {
        var thisOptions = e.currentTarget.options;
        window.location.hash = thisOptions[thisOptions.selectedIndex].value;
      });

      // add to page
      doc.insertBefore(selectWrap, startOfContent);
    }
    function onScroll() {
      var targetPosition = doc.parentNode.offsetTop;
      var activeFragment;

      headings.some(function(heading) {
        if (heading.getBoundingClientRect().top < targetPosition) {
          activeFragment = '#' + heading.id;
        } else {
          return true;
        }
      });

      if (activeFragment) {
        if (lastActiveFragment) {
          links[lastActiveFragment].classList.remove('active');
        }
        var activeLink = links[activeFragment];
        activeLink.classList.add('active');
        if (menu.scrollHeight > menu.offsetHeight) {
          menu.scrollTop = Math.max(
            0,
            activeLink.offsetTop + activeLink.offsetHeight - menu.offsetHeight
          );
        }
        lastActiveFragment = activeFragment;
      } else if (lastActiveFragment) {
        links[lastActiveFragment].classList.remove('active');
        lastActiveFragment = undefined;
      }
    }

    function find(selector, from) {
      return toArray((from || document).querySelectorAll(selector));
    }

    function toArray(collection) {
      return [].slice.call(collection);
    }
  });
})();
//# sourceMappingURL=site.js.map
