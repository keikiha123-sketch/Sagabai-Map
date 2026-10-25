

  // ============================================
  // MENUドロップダウン
  // ============================================
  
  const menuBtn = document.getElementById('menuBtn');
  const menuDropdown = document.getElementById('menuDropdown');
  
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';

    if (isOpen) {
      closeMenuDropdown();
    } else {
      openMenuDropdown();
    }
  });
  
  function openMenuDropdown() {
    menuBtn.setAttribute('aria-expanded', 'true');
    menuDropdown.removeAttribute('hidden');
  }
  
  function closeMenuDropdown() {
    menuBtn.setAttribute('aria-expanded', 'false');
    menuDropdown.setAttribute('hidden', '');
  }


  

  
  // ============================================
  // 外部クリックで閉じる
  // ============================================
  
  document.addEventListener('click', () => {
    closeMenuDropdown();
  });
  
  // ドロップダウン内部のクリックは伝播させない
  menuDropdown.addEventListener('click', (e) => e.stopPropagation());
  
  // ============================================
  // ESCキーで閉じる
  // ============================================
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenuDropdown();
    }
  });
