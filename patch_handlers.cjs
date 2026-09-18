const fs = require('fs');
let code = fs.readFileSync('src/components/Admin/StoreSettingsView.tsx', 'utf8');

function addSave(funcName) {
  // We'll manually replace because each has different setFormData pattern
}

// Just to ensure I don't mess up, I'll provide direct replacements for each handler block.

// 1. handleAddRunwaySlide
code = code.replace(
  /setFormData\(\(prev\) => \(\{\n      \.\.\.prev,\n      runwaySlides: \[\.\.\.currentSlides, newSlide\]\n    \}\)\);/,
  `const updated = { ...formData, runwaySlides: [...currentSlides, newSlide] };
    setFormData(updated);
    onSaveSettings(updated);`
);

// 2. handleRemoveRunwaySlide
code = code.replace(
  /setFormData\(\(prev\) => \(\{\n      \.\.\.prev,\n      runwaySlides: currentSlides\.filter\(\(s\) => s\.id !== id\)\n    \}\)\);/,
  `const updated = { ...formData, runwaySlides: currentSlides.filter((s) => s.id !== id) };
    setFormData(updated);
    onSaveSettings(updated);`
);

// 3. handleMoveSlide
code = code.replace(
  /setFormData\(\(prev\) => \(\{\n      \.\.\.prev,\n      runwaySlides: currentSlides\n    \}\)\);/,
  `const updated = { ...formData, runwaySlides: currentSlides };
    setFormData(updated);
    onSaveSettings(updated);`
);

// 4. handleAddShippingOption
code = code.replace(
  /setFormData\(\(prev\) => \(\{\n      \.\.\.prev,\n      shippingOptions: \[\.\.\.\(prev\.shippingOptions \|\| \[\]\), newOption\]\n    \}\)\);/,
  `const updated = { ...formData, shippingOptions: [...(formData.shippingOptions || []), newOption] };
    setFormData(updated);
    onSaveSettings(updated);`
);

// 5. handleToggleShippingOption
code = code.replace(
  /setFormData\(\(prev\) => \(\{\n      \.\.\.prev,\n      shippingOptions: updated\n    \}\)\);/,
  `const finalUpdated = { ...formData, shippingOptions: updated };
    setFormData(finalUpdated);
    onSaveSettings(finalUpdated);`
);

// 6. handleDeleteShippingOption
code = code.replace(
  /setFormData\(\(prev\) => \(\{\n      \.\.\.prev,\n      shippingOptions: updated\n    \}\)\);/,
  `const finalUpdated = { ...formData, shippingOptions: updated };
    setFormData(finalUpdated);
    onSaveSettings(finalUpdated);`
);

// 7. handleLogoUpload
code = code.replace(
  /setFormData\(\(prev\) => \(\{ \.\.\.prev, logoUrl: compressedUrl \}\)\);/,
  `const updated = { ...formData, logoUrl: compressedUrl };
        setFormData(updated);
        onSaveSettings(updated);`
);

// 8. handleDriverPhotoUpload
code = code.replace(
  /setFormData\(\(prev\) => \(\{ \.\.\.prev, driverPhoto: compressedUrl \}\)\);/,
  `const updated = { ...formData, driverPhoto: compressedUrl };
        setFormData(updated);
        onSaveSettings(updated);`
);

// 9. handleYapeQrUpload
code = code.replace(
  /setFormData\(\(prev\) => \(\{ \.\.\.prev, yapeQrUrl: compressedUrl \}\)\);/,
  `const updated = { ...formData, yapeQrUrl: compressedUrl };
        setFormData(updated);
        onSaveSettings(updated);`
);

fs.writeFileSync('src/components/Admin/StoreSettingsView.tsx', code);
