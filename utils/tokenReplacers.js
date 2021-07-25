const fsPath = require( 'path' );

const { tableFormatters } = require( './tableFormatters' );
const { fileExist, readFileAsText } = require( './fileHelpers' );

async function getTokenValue( token, tokens, markdown, DO_REPLACETOKENS ) {

  if ( token.slice( 0, 5 ).toLowerCase() === 'file_' ) {

    const filePath = fsPath.join( '.', ...tokens[token] );
    const exists = await fileExist( filePath );

    if ( !exists )
      return `<span class="--missingtoken --fwbold">File Not Found: ${filePath}</span>`;

    const text = await readFileAsText( filePath );

    return ( DO_REPLACETOKENS ) ?
      replaceTokens( tokens, text, DO_REPLACETOKENS ) :
      text;

  }

  if ( token.slice( 0, 6 ) === 'table_' && tableFormatters[token] ) {

    const table = tableFormatters[token]( tokens[token], tokens );

    return ( DO_REPLACETOKENS ) ?
      replaceTokens( tokens, table, DO_REPLACETOKENS ) :
      table;

  }

  if ( !DO_REPLACETOKENS )
    return `{{${token}}}`;

  return tokens[token];


}

function highlightMissingTokens( markdown ) {

  const start = new RegExp( '{{', 'g' );
  const end = new RegExp( '}}', 'g' );

  const replaced = markdown.replace( start, '<span class="--missingtoken --fwbold">' );
  return replaced.replace( end, '</span>' );

}

async function replaceTokens( tokens, markdown, DO_REPLACETOKENS ) {

  const keys = Object.keys( tokens );
  let replaced = markdown;

  for ( const k of keys ) {

    if ( replaced.indexOf( k ) === -1  )
      continue;

    const regex = new RegExp( `{{${k}}}`, 'g' );
    const replacement = await getTokenValue( k, tokens, markdown, DO_REPLACETOKENS );

    replaced = replaced.replace( regex, replacement );

  }

  return replaced;

}

module.exports = {
  getTokenValue,
  highlightMissingTokens,
  replaceTokens,
};