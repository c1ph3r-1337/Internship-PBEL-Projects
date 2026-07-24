(function () {
  function buildSearch() {
    var search = document.querySelector('reddit-search-large');
    if (!search) {
      search = document.querySelector('.local-fixed-search-wrapper');
    }
    if (!search || search.dataset.localFixed === 'true') {
      return;
    }

    var shell = document.createElement('div');
    shell.className = 'local-search-shell';
    shell.innerHTML = [
      '<div class="local-search-logo-container">',
      '  <svg class="local-search-reddit-logo" width="28" height="28" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" xml:space="preserve" xmlns:xlink="http://www.w3.org/1999/xlink">',
      '    <g clip-path="url(#clip0_2033_71574)">',
      '      <circle cx="128" cy="128" r="128" fill="#FF4500"></circle>',
      '      <path d="M55.44 153.54C71.9478 153.54 85.33 140.158 85.33 123.65C85.33 107.142 71.9478 93.76 55.44 93.76C38.9322 93.76 25.55 107.142 25.55 123.65C25.55 140.158 38.9322 153.54 55.44 153.54Z" fill="url(#paint0_radial_2033_71574)"></path>',
      '      <path d="M200.56 153.54C217.068 153.54 230.45 140.158 230.45 123.65C230.45 107.142 217.068 93.76 200.56 93.76C184.052 93.76 170.67 107.142 170.67 123.65C170.67 140.158 184.052 153.54 200.56 153.54Z" fill="url(#paint1_radial_2033_71574)"></path>',
      '      <path d="M128.07 213.33C175.196 213.33 213.4 184.676 213.4 149.33C213.4 113.984 175.196 85.33 128.07 85.33C80.9435 85.33 42.74 113.984 42.74 149.33C42.74 184.676 80.9435 213.33 128.07 213.33Z" fill="url(#paint2_radial_2033_71574)"></path>',
      '      <path d="M102.84 143.11C102.34 153.95 95.14 157.89 86.77 157.89C78.4 157.89 72 152.34 72.5 141.5C73 130.66 80.2 123.48 88.57 123.48C96.94 123.48 103.34 132.27 102.84 143.11Z" fill="#842123"></path>',
      '      <path d="M183.64 141.49C184.14 152.33 177.75 157.88 169.37 157.88C160.99 157.88 153.79 153.95 153.3 143.1C152.8 132.26 159.19 123.47 167.57 123.47C175.95 123.47 183.15 130.64 183.64 141.49Z" fill="#842123"></path>',
      '      <path d="M102.85 144.05C102.38 154.2 95.65 157.88 87.81 157.88C79.97 157.88 73.99 152.37 74.46 142.22C74.93 132.07 81.66 125.43 89.5 125.43C97.34 125.43 103.32 133.9 102.85 144.05Z" fill="url(#paint3_radial_2033_71574)"></path>',
      '      <path d="M166.65 125.44C174.49 125.44 181.22 132.08 181.69 142.23C182.16 152.38 176.18 157.89 168.34 157.89C160.5 157.89 153.77 154.21 153.3 144.06C152.83 133.91 158.81 125.44 166.65 125.44Z" fill="url(#paint4_radial_2033_71574)"></path>',
      '      <path d="M128.07 165.12C117.49 165.12 107.35 165.63 97.97 166.56C96.37 166.72 95.35 168.35 95.97 169.81C101.22 182.12 113.61 190.77 128.07 190.77C142.53 190.77 154.91 182.12 160.17 169.81C160.79 168.35 159.78 166.72 158.17 166.56C148.79 165.63 138.65 165.12 128.07 165.12Z" fill="#BBCFDA"></path>',
      '      <path d="M128.07 167.47C117.52 167.47 107.41 167.99 98.06 168.94C96.46 169.1 95.45 170.76 96.07 172.24C101.31 184.75 113.66 193.53 128.06 193.53C142.46 193.53 154.82 184.74 160.06 172.24C160.68 170.76 159.67 169.1 158.07 168.94C148.72 167.99 138.61 167.47 128.06 167.47H128.07Z" fill="white"></path>',
      '      <path d="M128.07 166.25C117.69 166.25 107.74 166.76 98.53 167.69C96.96 167.85 95.96 169.48 96.57 170.94C101.72 183.25 113.88 191.9 128.07 191.9C142.26 191.9 154.41 183.25 159.57 170.94C160.18 169.48 159.18 167.85 157.61 167.69C148.41 166.76 138.46 166.25 128.07 166.25Z" fill="url(#paint5_radial_2033_71574)"></path>',
      '      <path d="M174.81 76.63C186.507 76.63 195.99 67.1474 195.99 55.45C195.99 43.7526 186.507 34.27 174.81 34.27C163.113 34.27 153.63 43.7526 153.63 55.45C153.63 67.1474 163.113 76.63 174.81 76.63Z" fill="url(#paint6_radial_2033_71574)"></path>',
      '      <path d="M127.77 88.03C125.23 88.03 123.18 86.97 123.18 85.33C123.18 66.35 138.62 50.92 157.59 50.92C160.13 50.92 162.18 52.98 162.18 55.51C162.18 58.04 160.12 60.1 157.59 60.1C143.68 60.1 132.36 71.42 132.36 85.33C132.36 86.97 130.3 88.03 127.77 88.03Z" fill="url(#paint7_radial_2033_71574)"></path>',
      '      <path d="M97.27 149.07C97.27 153 93.09 154.76 87.94 154.76C82.79 154.76 78.61 153 78.61 149.07C78.61 145.14 82.79 141.96 87.94 141.96C93.09 141.96 97.27 145.14 97.27 149.07Z" fill="#FF6101"></path>',
      '      <path d="M177.54 149.07C177.54 153 173.36 154.76 168.21 154.76C163.06 154.76 158.88 153 158.88 149.07C158.88 145.14 163.06 141.96 168.21 141.96C173.36 141.96 177.54 145.14 177.54 149.07Z" fill="#FF6101"></path>',
      '      <path d="M94.38 138.41C96.2136 138.41 97.7 136.789 97.7 134.79C97.7 132.791 96.2136 131.17 94.38 131.17C92.5464 131.17 91.06 132.791 91.06 134.79C91.06 136.789 92.5464 138.41 94.38 138.41Z" fill="#FFC49C"></path>',
      '      <path d="M173.29 138.41C175.124 138.41 176.61 136.789 176.61 134.79C176.61 132.791 175.124 131.17 173.29 131.17C171.456 131.17 169.97 132.791 169.97 134.79C169.97 136.789 171.456 138.41 173.29 138.41Z" fill="#FFC49C"></path>',
      '    </g>',
      '    <defs>',
      '      <radialgradient id="paint0_radial_2033_71574" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(57.1401 107.558) scale(59.9015 52.2545)">',
      '        <stop stop-color="#FEFFFF"></stop>',
      '        <stop offset="0.4" stop-color="#FEFFFF"></stop>',
      '        <stop offset="0.51" stop-color="#F9FCFC"></stop>',
      '        <stop offset="0.62" stop-color="#EDF3F5"></stop>',
      '        <stop offset="0.7" stop-color="#DEE9EC"></stop>',
      '        <stop offset="0.72" stop-color="#D8E4E8"></stop>',
      '        <stop offset="0.76" stop-color="#CCD8DF"></stop>',
      '        <stop offset="0.8" stop-color="#C8D5DD"></stop>',
      '        <stop offset="0.83" stop-color="#CCD6DE"></stop>',
      '        <stop offset="0.85" stop-color="#D8DBE2"></stop>',
      '        <stop offset="0.88" stop-color="#EDE3E9"></stop>',
      '        <stop offset="0.9" stop-color="#FFEBEF"></stop>',
      '      </radialgradient>',
      '      <radialgradient id="paint1_radial_2033_71574" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(225.01 107.558) rotate(-180) scale(59.9015 52.2545)">',
      '        <stop stop-color="#FEFFFF"></stop>',
      '        <stop offset="0.4" stop-color="#FEFFFF"></stop>',
      '        <stop offset="0.51" stop-color="#F9FCFC"></stop>',
      '        <stop offset="0.62" stop-color="#EDF3F5"></stop>',
      '        <stop offset="0.7" stop-color="#DEE9EC"></stop>',
      '        <stop offset="0.72" stop-color="#D8E4E8"></stop>',
      '        <stop offset="0.76" stop-color="#CCD8DF"></stop>',
      '        <stop offset="0.8" stop-color="#C8D5DD"></stop>',
      '        <stop offset="0.83" stop-color="#CCD6DE"></stop>',
      '        <stop offset="0.85" stop-color="#D8DBE2"></stop>',
      '        <stop offset="0.88" stop-color="#EDE3E9"></stop>',
      '        <stop offset="0.9" stop-color="#FFEBEF"></stop>',
      '      </radialgradient>',
      '      <radialgradient id="paint2_radial_2033_71574" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(130.347 99.1759) scale(180.687 126.865)">',
      '        <stop stop-color="#FEFFFF"></stop>',
      '        <stop offset="0.4" stop-color="#FEFFFF"></stop>',
      '        <stop offset="0.51" stop-color="#F9FCFC"></stop>',
      '        <stop offset="0.62" stop-color="#EDF3F5"></stop>',
      '        <stop offset="0.7" stop-color="#DEE9EC"></stop>',
      '        <stop offset="0.72" stop-color="#D8E4E8"></stop>',
      '        <stop offset="0.76" stop-color="#CCD8DF"></stop>',
      '        <stop offset="0.8" stop-color="#C8D5DD"></stop>',
      '        <stop offset="0.83" stop-color="#CCD6DE"></stop>',
      '        <stop offset="0.85" stop-color="#D8DBE2"></stop>',
      '        <stop offset="0.88" stop-color="#EDE3E9"></stop>',
      '        <stop offset="0.9" stop-color="#FFEBEF"></stop>',
      '      </radialgradient>',
      '      <radialgradient id="paint3_radial_2033_71574" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(90.1905 150.971) scale(15.0964 22.1628)">',
      '        <stop stop-color="#FF6600"></stop>',
      '        <stop offset="0.5" stop-color="#FF4500"></stop>',
      '        <stop offset="0.7" stop-color="#FC4301"></stop>',
      '        <stop offset="0.82" stop-color="#F43F07"></stop>',
      '        <stop offset="0.92" stop-color="#E53812"></stop>',
      '        <stop offset="1" stop-color="#D4301F"></stop>',
      '      </radialgradient>',
      '      <radialgradient id="paint4_radial_2033_71574" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(168.756 150.971) rotate(180) scale(15.0964 22.1628)">',
      '        <stop stop-color="#FF6600"></stop>',
      '        <stop offset="0.5" stop-color="#FF4500"></stop>',
      '        <stop offset="0.7" stop-color="#FC4301"></stop>',
      '        <stop offset="0.82" stop-color="#F43F07"></stop>',
      '        <stop offset="0.92" stop-color="#E53812"></stop>',
      '        <stop offset="1" stop-color="#D4301F"></stop>',
      '      </radialgradient>',
      '      <radialgradient id="paint5_radial_2033_71574" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(128.369 194.908) scale(53.2322 35.1106)">',
      '        <stop stop-color="#172E35"></stop>',
      '        <stop offset="0.29" stop-color="#0E1C21"></stop>',
      '        <stop offset="0.73" stop-color="#030708"></stop>',
      '        <stop offset="1"></stop>',
      '      </radialgradient>',
      '      <radialgradient id="paint6_radial_2033_71574" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(175.312 34.1061) scale(46.7274 46.7274)">',
      '        <stop stop-color="#FEFFFF"></stop>',
      '        <stop offset="0.4" stop-color="#FEFFFF"></stop>',
      '        <stop offset="0.51" stop-color="#F9FCFC"></stop>',
      '        <stop offset="0.62" stop-color="#EDF3F5"></stop>',
      '        <stop offset="0.7" stop-color="#DEE9EC"></stop>',
      '        <stop offset="0.72" stop-color="#D8E4E8"></stop>',
      '        <stop offset="0.76" stop-color="#CCD8DF"></stop>',
      '        <stop offset="0.8" stop-color="#C8D5DD"></stop>',
      '        <stop offset="0.83" stop-color="#CCD6DE"></stop>',
      '        <stop offset="0.85" stop-color="#D8DBE2"></stop>',
      '        <stop offset="0.88" stop-color="#EDE3E9"></stop>',
      '        <stop offset="0.9" stop-color="#FFEBEF"></stop>',
      '      </radialgradient>',
      '      <radialgradient id="paint7_radial_2033_71574" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(155.84 85.0459) scale(38.3003 38.3003)">',
      '        <stop offset="0.48" stop-color="#7A9299"></stop>',
      '        <stop offset="0.67" stop-color="#172E35"></stop>',
      '        <stop offset="0.75"></stop>',
      '        <stop offset="0.82" stop-color="#172E35"></stop>',
      '      </radialgradient>',
      '      <clippath id="clip0_2033_71574">',
      '        <rect width="256" height="256" fill="white"></rect>',
      '      </clippath>',
      '    </defs>',
      '  </svg>',
      '</div>',
      '<input class="local-search-input" type="search" placeholder="Find anything" aria-label="Search Reddit">',
      '<div class="local-search-divider"></div>',
      '<a href="https://www.reddit.com/answers/" class="local-search-ask">',
      '  <svg class="local-search-ask-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">',
      '    <path d="M15.11 8.7l-1.63-.34c-.93-.19-1.65-.91-1.84-1.84l-.34-1.63c-.23-1.12-1.16-1.87-2.3-1.87s-2.07.75-2.3 1.87l-.34 1.63c-.19.93-.92 1.65-1.84 1.84l-1.63.34c-1.12.23-1.87 1.16-1.87 2.3s.75 2.07 1.87 2.3l1.63.34c.93.19 1.65.91 1.84 1.84l.34 1.63c.23 1.12 1.16 1.87 2.3 1.87s2.07-.75 2.3-1.87l.34-1.63c.19-.93.92-1.65 1.84-1.84l1.63-.34c1.12-.23 1.87-1.16 1.87-2.3s-.75-2.07-1.87-2.3zm-.37 2.84l-1.63.34c-1.63.34-2.9 1.61-3.24 3.24l-.34 1.63c-.08.4-.4.44-.54.44s-.46-.04-.54-.44l-.34-1.63a4.178 4.178 0 00-3.24-3.24l-1.63-.34c-.39-.08-.44-.4-.44-.54s.04-.46.44-.54l1.63-.34c1.63-.34 2.9-1.61 3.24-3.24l.34-1.63c.08-.4.4-.44.54-.44s.46.04.54.44l.34 1.63c.34 1.63 1.61 2.9 3.24 3.24l1.63.34c.39.08.44.4.44.54s-.04.46-.44.54zM18 3.1h-1.1V2c0-.5-.4-.9-.9-.9s-.9.4-.9.9v1.1H14c-.5 0-.9.4-.9.9s.4.9.9.9h1.1V6c0 .5.4.9.9.9s.9-.4.9-.9V4.9H18c.5 0 .9-.4.9-.9s-.4-.9-.9-.9z"></path>',
      '  </svg>',
      '  <span>Ask</span>',
      '</a>'
    ].join('\n');

    if (search.tagName.toLowerCase() === 'reddit-search-large') {
      var wrapper = document.createElement('div');
      wrapper.className = search.className + ' local-fixed-search-wrapper';
      wrapper.appendChild(shell);
      wrapper.dataset.localFixed = 'true';
      search.parentNode.replaceChild(wrapper, search);
    } else {
      search.replaceChildren(shell);
      search.dataset.localFixed = 'true';
    }

    var input = shell.querySelector('.local-search-input');
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        var query = input.value.trim();
        if (query) {
          window.location.href = 'https://www.reddit.com/search/?q=' + encodeURIComponent(query);
        }
      }
    });

    var askButton = shell.querySelector('.local-search-ask');
    askButton.addEventListener('click', function(e) {
      e.preventDefault();
      var query = input.value.trim();
      if (query) {
        window.location.href = 'https://www.reddit.com/answers/?q=' + encodeURIComponent(query);
      } else {
        window.location.href = 'https://www.reddit.com/answers/';
      }
    });
  }

  function buildAuthRail() {
    var container = document.querySelector('#left-sidebar-container .flex.flex-col.gap-xs.w-full.h-full');
    if (!container || container.dataset.localFixed === 'true') {
      return;
    }

    container.dataset.localFixed = 'true';
    container.innerHTML = [
      '<div class="local-auth-stack">',
      '  <a class="local-auth-button" href="/login">',
      '    <span class="local-auth-icon">',
      '      <svg width="20" height="20" viewBox="0 0 18 18">',
      '        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>',
      '        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>',
      '        <path d="M3.964 10.707a5.416 5.416 0 010-3.414V4.961H.957a8.997 8.997 0 000 8.078l3.007-2.332z" fill="#FBBC05"/>',
      '        <path d="M9 3.579c1.32 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961l3.007 2.332C4.672 5.163 6.656 3.579 9 3.579z" fill="#EA4335"/>',
      '      </svg>',
      '    </span>',
      '    <span>Continue with Google</span>',
      '  </a>',
      '  <a class="local-auth-button" href="/login">',
      '    <span class="local-auth-icon">',
      '      <svg width="20" height="20" viewBox="0 0 18 18">',
      '        <path d="M8.816 4.154c.788 0 1.776-.55 2.365-1.282.533-.663.921-1.59.921-2.517 0-.126-.011-.252-.033-.355-.877.034-1.932.607-2.565 1.373-.5.584-.955 1.499-.955 2.437 0 .137.022.275.033.32.056.012.144.023.233.023zm-2.775 13.846c1.077 0 1.554-.744 2.898-.744 1.365 0 1.665.721 2.864.721 1.177 0 1.965-1.121 2.709-2.22.833-1.259 1.177-2.495 1.199-2.552-.078-.023-2.331-.973-2.331-3.639 0-2.312 1.776-3.353 1.876-3.433-1.177-1.74-2.964-1.785-3.453-1.785-1.321 0-2.398.824-3.075.824-.733 0-1.698-.778-2.842-.778-2.176 0-4.385 1.854-4.385 5.355 0 2.174.821 4.474 1.832 5.962.866 1.259 1.621 2.289 2.709 2.289z" fill="#000000"></path>',
      '      </svg>',
      '    </span>',
      '    <span>Continue with Apple</span>',
      '  </a>',
      '  <a class="local-auth-button" href="/login">',
      '    <span class="local-auth-icon">',
      '      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">',
      '        <path d="M13.7 19H6.3C4.48 19 3 17.52 3 15.7V4.3C3 2.48 4.48 1 6.3 1h7.4C15.52 1 17 2.48 17 4.3v11.4c0 1.82-1.48 3.3-3.3 3.3zM6.3 2.8c-.83 0-1.5.67-1.5 1.5v11.4c0 .83.67 1.5 1.5 1.5h7.4c.83 0 1.5-.67 1.5-1.5V4.3c0-.83-.67-1.5-1.5-1.5H6.3z"></path><path d="M12.5 4.2h-5V6h5V4.2z"></path>',
      '      </svg>',
      '    </span>',
      '    <span>Continue with Phone Number</span>',
      '  </a>',
      '  <a class="local-auth-button" href="/login">',
      '    <span class="local-auth-icon">',
      '      <svg fill="currentColor" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">',
      '        <path d="M15.7 3H4.3A3.3 3.3 0 001 6.3v7.4A3.3 3.3 0 004.3 17h11.4a3.3 3.3 0 003.3-3.3V6.3A3.3 3.3 0 0015.7 3zm0 1.8c.384 0 .731.149.996.387l-5.661 4.807c-.6.51-1.47.511-2.071 0l-5.66-4.807c.266-.238.612-.387.996-.387h11.4zm0 10.4H4.3c-.827 0-1.5-.673-1.5-1.5V7.121l4.999 4.244a3.39 3.39 0 004.402.001L17.2 7.121V13.7c0 .827-.673 1.5-1.5 1.5z"></path>',
      '      </svg>',
      '    </span>',
      '    <span>Continue with Email</span>',
      '  </a>',
      '</div>'
    ].join('\n');
  }

  function formatScore(num) {
    var absNum = Math.abs(num);
    if (absNum >= 1000000) {
      var val = num / 1000000;
      return (val >= 10 || val <= -10 ? Math.round(val) : val.toFixed(1).replace('.0', '')) + 'M';
    }
    if (absNum >= 1000) {
      var val = num / 1000;
      return (val >= 10 || val <= -10 ? Math.round(val) : val.toFixed(1).replace('.0', '')) + 'K';
    }
    return num.toString();
  }

  function handleUpvote(btn) {
    var el = btn.closest('shreddit-vote-animations');
    if (!el) return;
    var faceplateNumber = el.querySelector('faceplate-number');
    var downvoteBtn = el.querySelector('button[data-action-bar-action="downvote"]');
    if (!faceplateNumber || !downvoteBtn) return;
    var group = btn.closest('.rpl-vote-button-group');
    if (!group) return;

    var baseScore = parseInt(faceplateNumber.getAttribute('data-base-score') || faceplateNumber.getAttribute('number'), 10) || 0;
    if (!faceplateNumber.hasAttribute('data-base-score')) {
      faceplateNumber.setAttribute('data-base-score', baseScore);
    }

    var currentState = group.getAttribute('data-local-state') || 'neutral';
    var newState = (currentState === 'upvoted') ? 'neutral' : 'upvoted';

    var scoreDiff = 0;
    if (newState === 'upvoted') scoreDiff = 1;
    else if (newState === 'downvoted') scoreDiff = -1;
    var newScore = baseScore + scoreDiff;

    faceplateNumber.setAttribute('number', newScore);
    faceplateNumber.textContent = formatScore(newScore);
    group.setAttribute('data-local-state', newState);

    btn.setAttribute('aria-pressed', newState === 'upvoted' ? 'true' : 'false');
    downvoteBtn.setAttribute('aria-pressed', 'false');
  }

  function handleDownvote(btn) {
    var el = btn.closest('shreddit-vote-animations');
    if (!el) return;
    var faceplateNumber = el.querySelector('faceplate-number');
    var upvoteBtn = el.querySelector('button[data-action-bar-action="upvote"]');
    if (!faceplateNumber || !upvoteBtn) return;
    var group = btn.closest('.rpl-vote-button-group');
    if (!group) return;

    var baseScore = parseInt(faceplateNumber.getAttribute('data-base-score') || faceplateNumber.getAttribute('number'), 10) || 0;
    if (!faceplateNumber.hasAttribute('data-base-score')) {
      faceplateNumber.setAttribute('data-base-score', baseScore);
    }

    var currentState = group.getAttribute('data-local-state') || 'neutral';
    var newState = (currentState === 'downvoted') ? 'neutral' : 'downvoted';

    var scoreDiff = 0;
    if (newState === 'upvoted') scoreDiff = 1;
    else if (newState === 'downvoted') scoreDiff = -1;
    var newScore = baseScore + scoreDiff;

    faceplateNumber.setAttribute('number', newScore);
    faceplateNumber.textContent = formatScore(newScore);
    group.setAttribute('data-local-state', newState);

    btn.setAttribute('aria-pressed', newState === 'downvoted' ? 'true' : 'false');
    upvoteBtn.setAttribute('aria-pressed', 'false');
  }

  function handleJoin(btn, host) {
    if (host && host.shadowRoot && host.dataset.localStyled !== 'true') {
      host.dataset.localStyled = 'true';
      var style = document.createElement('style');
      style.textContent = [
        '.join-btn {',
        '  display: inline-flex !important;',
        '  align-items: center !important;',
        '  justify-content: center !important;',
        '  background-color: #ffffff !important;',
        '  color: #0f1416 !important;',
        '  border: none !important;',
        '  border-radius: 9999px !important;',
        '  padding: 4px 12px !important;',
        '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;',
        '  font-size: 12px !important;',
        '  font-weight: 700 !important;',
        '  cursor: pointer !important;',
        '  height: 24px !important;',
        '  box-sizing: border-box !important;',
        '  transition: background-color 0.2s ease !important;',
        '}',
        '.join-btn:hover {',
        '  background-color: #e2e7e9 !important;',
        '}',
        '.join-btn[data-local-state="joined"] {',
        '  background-color: transparent !important;',
        '  border: 1px solid rgba(255, 255, 255, 0.2) !important;',
        '  color: #82959b !important;',
        '}',
        '.join-btn[data-local-state="joined"]:hover {',
        '  background-color: rgba(255, 255, 255, 0.05) !important;',
        '  color: #ffffff !important;',
        '}'
      ].join('\n');
      host.shadowRoot.appendChild(style);
    }

    var currentState = btn.getAttribute('data-local-state') || 'neutral';
    var newState = (currentState === 'joined') ? 'neutral' : 'joined';

    if (newState === 'joined') {
      btn.textContent = 'Joined';
      btn.classList.remove('button-primary');
      btn.classList.add('button-secondary');
      btn.setAttribute('data-local-state', 'joined');
    } else {
      btn.textContent = 'Join';
      btn.classList.remove('button-secondary');
      btn.classList.add('button-primary');
      btn.setAttribute('data-local-state', 'neutral');
    }
  }

  function styleAllJoinButtons() {
    var joinElements = document.querySelectorAll('shreddit-join-button');
    joinElements.forEach(function(el) {
      if (el.shadowRoot && el.dataset.localStyled !== 'true') {
        el.dataset.localStyled = 'true';
        var style = document.createElement('style');
        style.textContent = [
          '.join-btn {',
          '  display: inline-flex !important;',
          '  align-items: center !important;',
          '  justify-content: center !important;',
          '  background-color: #ffffff !important;',
          '  color: #0f1416 !important;',
          '  border: none !important;',
          '  border-radius: 9999px !important;',
          '  padding: 4px 12px !important;',
          '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;',
          '  font-size: 12px !important;',
          '  font-weight: 700 !important;',
          '  cursor: pointer !important;',
          '  height: 24px !important;',
          '  box-sizing: border-box !important;',
          '  transition: background-color 0.2s ease !important;',
          '}',
          '.join-btn:hover {',
          '  background-color: #e2e7e9 !important;',
          '}',
          '.join-btn[data-local-state="joined"] {',
          '  background-color: transparent !important;',
          '  border: 1px solid rgba(255, 255, 255, 0.2) !important;',
          '  color: #82959b !important;',
          '}',
          '.join-btn[data-local-state="joined"]:hover {',
          '  background-color: rgba(255, 255, 255, 0.05) !important;',
          '  color: #ffffff !important;',
          '}'
        ].join('\n');
        el.shadowRoot.appendChild(style);
      }
    });
  }

  function styleAllShareButtons() {
    var shareElements = document.querySelectorAll('shreddit-post-share-button');
    shareElements.forEach(function(el) {
      if (el.shadowRoot && el.dataset.localStyled !== 'true') {
        el.dataset.localStyled = 'true';
        var style = document.createElement('style');
        style.textContent = [
          'button {',
          '  display: inline-flex !important;',
          '  align-items: center !important;',
          '  justify-content: center !important;',
          '  background-color: rgba(255, 255, 255, 0.08) !important;',
          '  color: #f2f4f5 !important;',
          '  border: none !important;',
          '  border-radius: 9999px !important;',
          '  padding: 0 12px !important;',
          '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;',
          '  font-size: 12px !important;',
          '  font-weight: 700 !important;',
          '  cursor: pointer !important;',
          '  height: 32px !important;',
          '  box-sizing: border-box !important;',
          '  transition: background-color 0.15s ease, color 0.15s ease !important;',
          '}',
          'button:hover {',
          '  background-color: rgba(255, 255, 255, 0.15) !important;',
          '  color: #ffffff !important;',
          '}',
          'svg {',
          '  color: #82959b !important;',
          '  transition: color 0.15s ease !important;',
          '}',
          'button:hover svg {',
          '  color: #ffffff !important;',
          '}'
        ].join('\n');
        el.shadowRoot.appendChild(style);
      }
    });
  }

  function styleAllPosts() {
    var posts = document.querySelectorAll('shreddit-post');
    posts.forEach(function(el) {
      if (el.shadowRoot && el.dataset.localPostStyled !== 'true') {
        el.dataset.localPostStyled = 'true';
        var style = document.createElement('style');
        style.textContent = [
          'div[data-testid="action-row"] faceplate-screen-reader-content,',
          'rpl-action-bar faceplate-screen-reader-content {',
          '  border: 0 !important;',
          '  clip: rect(0 0 0 0) !important;',
          '  clip-path: inset(50%) !important;',
          '  height: 1px !important;',
          '  margin: -1px !important;',
          '  overflow: hidden !important;',
          '  padding: 0 !important;',
          '  position: absolute !important;',
          '  width: 1px !important;',
          '  white-space: nowrap !important;',
          '}',
          '.vote-icon-fill {',
          '  display: none !important;',
          '}',
          'div[data-testid="action-row"] button.button-secondary,',
          'div[data-testid="action-row"] a.button-secondary {',
          '  background-color: transparent !important;',
          '  border: none !important;',
          '  box-shadow: none !important;',
          '  outline: none !important;',
          '  margin: 0 !important;',
          '}',
          '.rpl-vote-button-group {',
          '  display: inline-flex !important;',
          '  flex-direction: row !important;',
          '  align-items: center !important;',
          '  background-color: rgba(255, 255, 255, 0.08) !important;',
          '  border-radius: 9999px !important;',
          '  height: 32px !important;',
          '  padding: 0 4px !important;',
          '  border: none !important;',
          '  box-shadow: none !important;',
          '  overflow: hidden !important;',
          '}',
          '.rpl-vote-button-group button[data-action-bar-action] {',
          '  background-color: transparent !important;',
          '  border: none !important;',
          '  border-radius: 9999px !important;',
          '  height: 28px !important;',
          '  width: 28px !important;',
          '  display: inline-flex !important;',
          '  align-items: center !important;',
          '  justify-content: center !important;',
          '  color: #82959b !important;',
          '  cursor: pointer !important;',
          '  padding: 0 !important;',
          '  margin: 0 !important;',
          '  transition: background-color 0.15s ease, color 0.15s ease !important;',
          '}',
          '.rpl-vote-button-group button[data-action-bar-action]:hover {',
          '  background-color: rgba(255, 255, 255, 0.1) !important;',
          '  color: #ffffff !important;',
          '}',
          '.rpl-vote-button-group faceplate-number {',
          '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;',
          '  font-size: 12px !important;',
          '  font-weight: 700 !important;',
          '  color: #f2f4f5 !important;',
          '  padding: 0 6px !important;',
          '  min-width: 24px !important;',
          '  text-align: center !important;',
          '  line-height: 28px !important;',
          '  display: inline-block !important;',
          '}',
          '.rpl-vote-button-group[data-local-state="upvoted"] button[data-action-bar-action="upvote"] {',
          '  color: #ff4500 !important;',
          '}',
          '.rpl-vote-button-group[data-local-state="upvoted"] faceplate-number {',
          '  color: #ff4500 !important;',
          '}',
          '.rpl-vote-button-group[data-local-state="upvoted"] button[data-action-bar-action="upvote"] .vote-icon-outline {',
          '  display: none !important;',
          '}',
          '.rpl-vote-button-group[data-local-state="upvoted"] button[data-action-bar-action="upvote"] .vote-icon-fill {',
          '  display: flex !important;',
          '}',
          '.rpl-vote-button-group[data-local-state="downvoted"] button[data-action-bar-action="downvote"] {',
          '  color: #4680c2 !important;',
          '}',
          '.rpl-vote-button-group[data-local-state="downvoted"] faceplate-number {',
          '  color: #4680c2 !important;',
          '}',
          '.rpl-vote-button-group[data-local-state="downvoted"] button[data-action-bar-action="downvote"] .vote-icon-outline {',
          '  display: none !important;',
          '}',
          '.rpl-vote-button-group[data-local-state="downvoted"] button[data-action-bar-action="downvote"] .vote-icon-fill {',
          '  display: flex !important;',
          '}',
          'a[data-action-bar-action="comments"] {',
          '  display: inline-flex !important;',
          '  align-items: center !important;',
          '  justify-content: center !important;',
          '  background-color: rgba(255, 255, 255, 0.08) !important;',
          '  color: #f2f4f5 !important;',
          '  border: none !important;',
          '  border-radius: 9999px !important;',
          '  padding: 0 12px !important;',
          '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;',
          '  font-size: 12px !important;',
          '  font-weight: 700 !important;',
          '  cursor: pointer !important;',
          '  height: 32px !important;',
          '  box-sizing: border-box !important;',
          '  transition: background-color 0.15s ease, color 0.15s ease !important;',
          '  text-decoration: none !important;',
          '}',
          'a[data-action-bar-action="comments"]:hover {',
          '  background-color: rgba(255, 255, 255, 0.15) !important;',
          '  color: #ffffff !important;',
          '  text-decoration: none !important;',
          '}',
          'a[data-action-bar-action="comments"] svg {',
          '  color: #82959b !important;',
          '  transition: color 0.15s ease !important;',
          '}',
          'a[data-action-bar-action="comments"]:hover svg {',
          '  color: #ffffff !important;',
          '}'
        ].join('\n');
        el.shadowRoot.appendChild(style);
      }
    });
  }

  // Set up event delegation on document for robust upvote, downvote, and join behavior inside shadow trees
  document.addEventListener('click', function(e) {
    var path = e.composedPath();
    for (var i = 0; i < path.length; i++) {
      var node = path[i];
      if (!node.tagName) continue;
      
      var tagName = node.tagName.toLowerCase();
      if (tagName === 'button') {
        var action = node.getAttribute('data-action-bar-action');
        if (action === 'upvote') {
          handleUpvote(node);
          return;
        } else if (action === 'downvote') {
          handleDownvote(node);
          return;
        } else if (node.classList.contains('join-btn')) {
          var host = node.getRootNode().host || e.target;
          handleJoin(node, host);
          return;
        }
      }
    }
  });

  // Delegation listener to inject styling on hover for dynamic/lazily loaded elements
  document.addEventListener('mouseover', function(e) {
    var path = e.composedPath();
    for (var i = 0; i < path.length; i++) {
      var node = path[i];
      if (!node.tagName) continue;
      
      var tagName = node.tagName.toLowerCase();
      if (tagName === 'shreddit-post') {
        if (node.shadowRoot && node.dataset.localPostStyled !== 'true') {
          node.dataset.localPostStyled = 'true';
          var style = document.createElement('style');
          style.textContent = [
            'div[data-testid="action-row"] faceplate-screen-reader-content,',
            'rpl-action-bar faceplate-screen-reader-content {',
            '  border: 0 !important;',
            '  clip: rect(0 0 0 0) !important;',
            '  clip-path: inset(50%) !important;',
            '  height: 1px !important;',
            '  margin: -1px !important;',
            '  overflow: hidden !important;',
            '  padding: 0 !important;',
            '  position: absolute !important;',
            '  width: 1px !important;',
            '  white-space: nowrap !important;',
            '}',
            '.vote-icon-fill {',
            '  display: none !important;',
            '}',
            'div[data-testid="action-row"] button.button-secondary,',
            'div[data-testid="action-row"] a.button-secondary {',
            '  background-color: transparent !important;',
            '  border: none !important;',
            '  box-shadow: none !important;',
            '  outline: none !important;',
            '  margin: 0 !important;',
            '}',
            '.rpl-vote-button-group {',
            '  display: inline-flex !important;',
            '  flex-direction: row !important;',
            '  align-items: center !important;',
            '  background-color: rgba(255, 255, 255, 0.08) !important;',
            '  border-radius: 9999px !important;',
            '  height: 32px !important;',
            '  padding: 0 4px !important;',
            '  border: none !important;',
            '  box-shadow: none !important;',
            '  overflow: hidden !important;',
            '}',
            '.rpl-vote-button-group button[data-action-bar-action] {',
            '  background-color: transparent !important;',
            '  border: none !important;',
            '  border-radius: 9999px !important;',
            '  height: 28px !important;',
            '  width: 28px !important;',
            '  display: inline-flex !important;',
            '  align-items: center !important;',
            '  justify-content: center !important;',
            '  color: #82959b !important;',
            '  cursor: pointer !important;',
            '  padding: 0 !important;',
            '  margin: 0 !important;',
            '  transition: background-color 0.15s ease, color 0.15s ease !important;',
            '}',
            '.rpl-vote-button-group button[data-action-bar-action]:hover {',
            '  background-color: rgba(255, 255, 255, 0.1) !important;',
            '  color: #ffffff !important;',
            '}',
            '.rpl-vote-button-group faceplate-number {',
            '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;',
            '  font-size: 12px !important;',
            '  font-weight: 700 !important;',
            '  color: #f2f4f5 !important;',
            '  padding: 0 6px !important;',
            '  min-width: 24px !important;',
            '  text-align: center !important;',
            '  line-height: 28px !important;',
            '  display: inline-block !important;',
            '}',
            '.rpl-vote-button-group[data-local-state="upvoted"] button[data-action-bar-action="upvote"] {',
            '  color: #ff4500 !important;',
            '}',
            '.rpl-vote-button-group[data-local-state="upvoted"] faceplate-number {',
            '  color: #ff4500 !important;',
            '}',
            '.rpl-vote-button-group[data-local-state="upvoted"] button[data-action-bar-action="upvote"] .vote-icon-outline {',
            '  display: none !important;',
            '}',
            '.rpl-vote-button-group[data-local-state="upvoted"] button[data-action-bar-action="upvote"] .vote-icon-fill {',
            '  display: flex !important;',
            '}',
            '.rpl-vote-button-group[data-local-state="downvoted"] button[data-action-bar-action="downvote"] {',
            '  color: #4680c2 !important;',
            '}',
            '.rpl-vote-button-group[data-local-state="downvoted"] faceplate-number {',
            '  color: #4680c2 !important;',
            '}',
            '.rpl-vote-button-group[data-local-state="downvoted"] button[data-action-bar-action="downvote"] .vote-icon-outline {',
            '  display: none !important;',
            '}',
            '.rpl-vote-button-group[data-local-state="downvoted"] button[data-action-bar-action="downvote"] .vote-icon-fill {',
            '  display: flex !important;',
            '}',
            'a[data-action-bar-action="comments"] {',
            '  display: inline-flex !important;',
            '  align-items: center !important;',
            '  justify-content: center !important;',
            '  background-color: rgba(255, 255, 255, 0.08) !important;',
            '  color: #f2f4f5 !important;',
            '  border: none !important;',
            '  border-radius: 9999px !important;',
            '  padding: 0 12px !important;',
            '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;',
            '  font-size: 12px !important;',
            '  font-weight: 700 !important;',
            '  cursor: pointer !important;',
            '  height: 32px !important;',
            '  box-sizing: border-box !important;',
            '  transition: background-color 0.15s ease, color 0.15s ease !important;',
            '  text-decoration: none !important;',
            '}',
            'a[data-action-bar-action="comments"]:hover {',
            '  background-color: rgba(255, 255, 255, 0.15) !important;',
            '  color: #ffffff !important;',
            '  text-decoration: none !important;',
            '}',
            'a[data-action-bar-action="comments"] svg {',
            '  color: #82959b !important;',
            '  transition: color 0.15s ease !important;',
            '}',
            'a[data-action-bar-action="comments"]:hover svg {',
            '  color: #ffffff !important;',
            '}'
          ].join('\n');
          node.shadowRoot.appendChild(style);
        }
      } else if (tagName === 'shreddit-post-share-button') {
        if (node.shadowRoot && node.dataset.localStyled !== 'true') {
          node.dataset.localStyled = 'true';
          var style = document.createElement('style');
          style.textContent = [
            'button {',
            '  display: inline-flex !important;',
            '  align-items: center !important;',
            '  justify-content: center !important;',
            '  background-color: rgba(255, 255, 255, 0.08) !important;',
            '  color: #f2f4f5 !important;',
            '  border: none !important;',
            '  border-radius: 9999px !important;',
            '  padding: 0 12px !important;',
            '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;',
            '  font-size: 12px !important;',
            '  font-weight: 700 !important;',
            '  cursor: pointer !important;',
            '  height: 32px !important;',
            '  box-sizing: border-box !important;',
            '  transition: background-color 0.15s ease, color 0.15s ease !important;',
            '}',
            'button:hover {',
            '  background-color: rgba(255, 255, 255, 0.15) !important;',
            '  color: #ffffff !important;',
            '}',
            'svg {',
            '  color: #82959b !important;',
            '  transition: color 0.15s ease !important;',
            '}',
            'button:hover svg {',
            '  color: #ffffff !important;',
            '}'
          ].join('\n');
          node.shadowRoot.appendChild(style);
        }
      } else if (tagName === 'shreddit-join-button') {
        if (node.shadowRoot && node.dataset.localStyled !== 'true') {
          node.dataset.localStyled = 'true';
          var style = document.createElement('style');
          style.textContent = [
            '.join-btn {',
            '  display: inline-flex !important;',
            '  align-items: center !important;',
            '  justify-content: center !important;',
            '  background-color: #ffffff !important;',
            '  color: #0f1416 !important;',
            '  border: none !important;',
            '  border-radius: 9999px !important;',
            '  padding: 4px 12px !important;',
            '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;',
            '  font-size: 12px !important;',
            '  font-weight: 700 !important;',
            '  cursor: pointer !important;',
            '  height: 24px !important;',
            '  box-sizing: border-box !important;',
            '  transition: background-color 0.2s ease !important;',
            '}',
            '.join-btn:hover {',
            '  background-color: #e2e7e9 !important;',
            '}',
            '.join-btn[data-local-state="joined"] {',
            '  background-color: transparent !important;',
            '  border: 1px solid rgba(255, 255, 255, 0.2) !important;',
            '  color: #82959b !important;',
            '}',
            '.join-btn[data-local-state="joined"]:hover {',
            '  background-color: rgba(255, 255, 255, 0.05) !important;',
            '  color: #ffffff !important;',
            '}'
          ].join('\n');
          node.shadowRoot.appendChild(style);
        }
      }
    }
  });

  function applyFixes() {
    buildSearch();
    buildAuthRail();
    styleAllJoinButtons();
    styleAllShareButtons();
    styleAllPosts();
  }

  document.addEventListener('DOMContentLoaded', applyFixes);
  window.addEventListener('load', applyFixes);
  setTimeout(applyFixes, 250);
  setTimeout(applyFixes, 1000);
})();
