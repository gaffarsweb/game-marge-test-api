const roles = {
	superAdmin: 'super_admin',
	admin: 'admin',
	backofficeUser: 'backoffice_user',
	user: 'user'
};

const roleAccess = {
	user: "userAccess",
	backofficeUser: "backofficeUserAccess",
	admin: "adminAccess",
	superAdmin: "superAdminAccess"
}

const transactionType = {
	WITHDRAW: "withdraw",
	DEPOSIT: "deposit",
	SPENDING: "spending",
	ADMIN_WITHDRAW: "admin_withdraw",
	winner_reward: "winner_reward",
	reward: "reward",
	airDropClaim: "airDropClaim",
	referral: "referral",
	task: "task",
	BUY_GAMERGE_DEBIT: "buy_gamerge_debit",
	BUY_GAMERGE_CREDIT: "buy_gamerge_credit"
};

const transactionStatus = {
	PENDING: "pending",
	SUCCESS: "success",
	FAILED: "failed",
};

const currency = {
	ETH: "ETH",
	USDT: "USDT",
	DAI: "DAI",
	BTC: "BTC",
	BNB: "BNB",
	MATIC: "MATIC"
};

const referralBonusType = {
	ON_SIGNUP : 'on_signup',
	ON_FIRST_TOURNAMENT : 'on_first_tournament'
  }

const roleRights = new Map();
roleRights.set(roles.superAdmin, [roleAccess.user, roleAccess?.backofficeUser, roleAccess.admin, roleAccess?.superAdmin]);
roleRights.set(roles.admin, [roleAccess.user, roleAccess?.backofficeUser, roleAccess.admin]);
roleRights.set(roles.backofficeUser, [roleAccess.user, roleAccess.backofficeUser]);
roleRights.set(roles.user, [roleAccess.user]);

const contentType = {
	applicationJSON: "application/json",			// JSON data
	multipartForm: "multipart/form-data",	// File uploads and forms with files
	formUrlencoded: "application/x-www-form-urlencoded", // Form data encoded as key-value pairs
	textPlain: "text/plain",                        // Plain text data
	textHtml: "text/html",                          // HTML data
	textCsv: "text/csv",                            // CSV data
	applicationXml: "application/xml",              // XML data
	textXml: "text/xml",                            // XML data (text format)
	applicationOctetStream: "application/octet-stream", // Binary data
	applicationPdf: "application/pdf",              // PDF files
	applicationZip: "application/zip",              // ZIP files
}

module.exports = {
	roles,
	roleRights,
	roleAccess,
	contentType,
	transactionStatus,
	transactionType,
	currency,
	referralBonusType
};
