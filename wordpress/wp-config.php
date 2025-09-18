<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'wp_series' );

/** Database username */
define( 'DB_USER', 'root' );

/** Database password */
define( 'DB_PASSWORD', '' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'f+i!oF8(EM>T(#@okr8$O.wfpu`<Q*1-_~869hn{XgA:qG.n42Xh;B,cnTo3wgGg' );
define( 'SECURE_AUTH_KEY',  'Gr:J5W9g>B{FKMN(JNZF{a#k4KG|Sw13gB]C@*xXSn~:I?{QEaG!vw?|[.v@=_uW' );
define( 'LOGGED_IN_KEY',    'sd384p+n9$C +K]Knrjr =YH/^a[N2:r+&0S*skVKOhiY$iKe{J-v_RB?VQjg,V2' );
define( 'NONCE_KEY',        '@)B[`6={]<AkiLhWhz-`E-[3,pUKmf1|InvWYcUJf/r7BTZk&Ce-5tM>a*W#A,3K' );
define( 'AUTH_SALT',        'j<2zr*QK3^FIwo)>~`=3}$$*T^sIV8kf{*c~.<7sGh^AO G|V(9k+`,yO-%xqK<!' );
define( 'SECURE_AUTH_SALT', '$N5B/+jQmZ lDJj)T92; xWSmV~YjvJ=2*W<4L:p&CoPkU*e;<mq(MsjE^.qs]&`' );
define( 'LOGGED_IN_SALT',   '?YhEIm![9woA3^V_k12UOxq5Zz-@(SR (or>j=TAyF$6s=}z}%7oKf<.3i`ji>bU' );
define( 'NONCE_SALT',       '=.]jX~_0AjxEvOCq/|W(A:(WY!D<bGGt wp@97i.jh)KA5[ paX*6$%7G2|n28J&' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 *
 * At the installation time, database tables are created with the specified prefix.
 * Changing this value after WordPress is installed will make your site think
 * it has not been installed.
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/#table-prefix
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
