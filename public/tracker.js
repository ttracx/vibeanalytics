(function() {
  'use strict';
  
  // Get configuration from script tag
  var script = document.currentScript;
  var projectId = script.getAttribute('data-project');
  var apiUrl = script.src.replace('/tracker.js', '/api/track');
  
  if (!projectId) {
    console.error('VibeAnalytics: Missing data-project attribute');
    return;
  }
  
  // Generate or retrieve session ID
  var sessionId = sessionStorage.getItem('va_session');
  if (!sessionId) {
    sessionId = 'va_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    sessionStorage.setItem('va_session', sessionId);
  }
  
  // Get or generate user ID
  var userId = localStorage.getItem('va_user');
  if (!userId) {
    userId = 'va_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    localStorage.setItem('va_user', userId);
  }
  
  // Track function
  function track(eventName, properties) {
    var payload = {
      projectId: projectId,
      name: eventName,
      sessionId: sessionId,
      userId: userId,
      properties: properties || {},
      url: window.location.href,
      referrer: document.referrer || null,
      timestamp: new Date().toISOString()
    };
    
    // Use sendBeacon for reliability, fallback to fetch
    if (navigator.sendBeacon) {
      navigator.sendBeacon(apiUrl, JSON.stringify(payload));
    } else {
      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(function() {});
    }
  }
  
  // Identify user
  function identify(id, traits) {
    userId = id;
    localStorage.setItem('va_user', id);
    if (traits) {
      track('$identify', traits);
    }
  }
  
  // Auto-track page views
  function trackPageView() {
    track('page_view', {
      title: document.title,
      path: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash
    });
  }
  
  // Track initial page view
  trackPageView();
  
  // Track SPA navigation
  var pushState = history.pushState;
  history.pushState = function() {
    pushState.apply(history, arguments);
    setTimeout(trackPageView, 0);
  };
  
  window.addEventListener('popstate', function() {
    setTimeout(trackPageView, 0);
  });
  
  // Track clicks on links with data-va-event attribute
  document.addEventListener('click', function(e) {
    var target = e.target.closest('[data-va-event]');
    if (target) {
      var eventName = target.getAttribute('data-va-event');
      var props = {};
      Array.from(target.attributes).forEach(function(attr) {
        if (attr.name.startsWith('data-va-') && attr.name !== 'data-va-event') {
          props[attr.name.replace('data-va-', '')] = attr.value;
        }
      });
      track(eventName, props);
    }
  });
  
  // Expose global API
  window.vibeanalytics = {
    track: track,
    identify: identify,
    pageview: trackPageView,
    getSessionId: function() { return sessionId; },
    getUserId: function() { return userId; }
  };
  
  // Dispatch ready event
  window.dispatchEvent(new CustomEvent('vibeanalytics:ready'));
})();
