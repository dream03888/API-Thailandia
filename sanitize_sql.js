const fs = require('fs');
const path = require('path');

const inputPath = 'C:/Users/user/Downloads/public.sql';
const outputPath = 'C:/Users/user/Downloads/clean_final.sql';

console.log('--- Start SUPER SURGICAL Sanitization ---');

try {
  // Read the whole file
  let content = fs.readFileSync(inputPath, 'utf8');

  console.log('--- Cleaning problematic lines carefully ---');

  // Regex that matches whole lines containing OWNER TO, GRANT, or REVOKE
  // Matches from beginning of line to the end of line including newline
  const cleanPatterns = [
    /^.*OWNER TO.*$/gm,
    /^.*GRANT.*$/gm,
    /^.*REVOKE.*$/gm,
    /^.*SET default_table_access_method.*$/gm,
    /^.*ALTER SCHEMA "public".*$/gm
  ];

  let cleanedContent = content;
  cleanPatterns.forEach(pattern => {
    cleanedContent = cleanedContent.replace(pattern, '-- REPLACED --');
  });

  const header = `
-- FINAL CLEAN SQL FOR RAILWAY
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
SET search_path = public;
\n`;

  fs.writeFileSync(outputPath, header + cleanedContent);

  console.log('--- Success! File cleaned without breaking statement structure. ---');
  console.log('--- Clean SQL saved to: ' + outputPath + ' ---');

} catch (err) {
  console.error('Error:', err.message);
}
