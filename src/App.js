import React, { useState, useEffect } from "react";
import { FaSearch, FaTimes, FaCopy } from "react-icons/fa";
import "./App.css";

const MIN_LENGTH = 26; // Minimum length of crypto addresses (e.g., Bitcoin)
const MAX_LENGTH = 128; // Maximum length of crypto addresses (e.g., Cardano)

const blockchainIcons = {
	SOL: "https://cryptologos.cc/logos/solana-sol-logo.png",
	ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
	BTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
	TETHER: "https://cryptologos.cc/logos/tether-usdt-logo.png",
	XRP: "https://cryptologos.cc/logos/xrp-xrp-logo.png",
};

const App = () => {
	const [searchMode, setSearchMode] = useState("gid"); // State to track search mode
	const [inputValue, setInputValue] = useState("");
	const [userData, setUserData] = useState(null);
	const [error, setError] = useState(null);
	const [users, setUsers] = useState([]);
	const [isButtonPulsing, setIsButtonPulsing] = useState(false);

	useEffect(() => {
		// Load users from local JSON file
		fetch("/externalWalletUsers.json")
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response.json();
			})
			.then((data) => {
				console.log("Loaded users:", data);
				setUsers(data);
			})
			.catch((error) => {
				console.error("Failed to load user data:", error);
				setError("Failed to load user data");
			});
	}, []);

	const handleInputChange = (event) => {
		setInputValue(event.target.value);
	};

	const handlePasteClick = async () => {
		try {
			const text = await navigator.clipboard.readText();
			setInputValue(text);
		} catch (err) {
			setError("Failed to read clipboard content");
		}
	};

	const clearInput = () => {
		setInputValue("");
		setUserData(null);
		setError(null);
	};

	const handleTabChange = (mode) => {
		setSearchMode(mode);
		clearInput(); // Reset the search when the tab is changed
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError(null);
		setUserData(null);
		setIsButtonPulsing(true);

		if (searchMode === "wallet") {
			if (inputValue.length < MIN_LENGTH || inputValue.length > MAX_LENGTH) {
				setError(`Wallet address length should be between ${MIN_LENGTH} and ${MAX_LENGTH} characters.`);
				setIsButtonPulsing(false);
				return;
			}
		} else if (searchMode === "gid") {
			if (inputValue.trim() === "") {
				setError("GID name cannot be empty.");
				setIsButtonPulsing(false);
				return;
			}
		}

		try {
			let foundUser = null;

			// If searching by wallet address
			if (searchMode === "wallet") {
				foundUser = users.find((user) => user.externalWallet.some((wallet) => wallet.address.toLowerCase() === inputValue.toLowerCase()));
				if (foundUser) {
					// Fetch the full user data from the API to get the profile image and other details
					const response = await fetch(`https://api.globalid.dev/v1/identities?gid_name=${foundUser.gid_name}`);
					const data = await response.json();

					if (!data || data.length === 0 || !data[0].gid_uuid) {
						throw new Error("User not found");
					}

					const apiUser = data[0];
					setUserData({ ...apiUser, externalWallet: foundUser.externalWallet });
					setIsButtonPulsing(false);
					return;
				} else {
					setError("Wallet address not found");
					setIsButtonPulsing(false);
					return;
				}
			}

			// If searching by GID name or no user found by wallet address
			const response = await fetch(`https://api.globalid.dev/v1/identities?gid_name=${inputValue}`);
			const data = await response.json();

			if (!data || data.length === 0 || !data[0].gid_uuid) {
				throw new Error("User not found");
			}

			const apiUser = data[0];
			const localUser = users.find((user) => user.gid_uuid === apiUser.gid_uuid);

			if (localUser) {
				setUserData({ ...apiUser, externalWallet: localUser.externalWallet });
			} else {
				setUserData({ ...apiUser, externalWallet: [] });
			}
		} catch (error) {
			setError(error.message);
		} finally {
			setIsButtonPulsing(false);
		}
	};

	const getBlockchainIcon = (type) => {
		return blockchainIcons[type];
	};

	const handleCopyClick = (address) => {
		navigator.clipboard
			.writeText(address)
			.then(() => {
				alert("Address copied to clipboard!");
			})
			.catch((err) => {
				console.error("Failed to copy address: ", err);
			});
	};

	return (
		<div className="container">
			<h1>Wallet Address Checker</h1>
			<div className="tabs">
				<button className={`tab ${searchMode === "gid" ? "active" : ""}`} onClick={() => handleTabChange("gid")}>
					Search by GID Name
				</button>
				<button className={`tab ${searchMode === "wallet" ? "active" : ""}`} onClick={() => handleTabChange("wallet")}>
					Search by Wallet Address
				</button>
			</div>
			<form onSubmit={handleSubmit} className="form">
				<div className="input-group">
					<input type="text" placeholder={searchMode === "gid" ? "Enter GID name" : "Enter wallet address"} value={inputValue} onChange={handleInputChange} className="input" />
					{inputValue && (
						<button type="button" onClick={clearInput} className="clear-button">
							<FaTimes />
						</button>
					)}
					<button type="button" onClick={handlePasteClick} className="paste-button">
						Paste
					</button>
				</div>
				<button type="submit" className={`search-button ${isButtonPulsing ? "pulsing" : ""}`}>
					<FaSearch />
				</button>
			</form>
			{error && <p className="error">{error}</p>}
			{userData && (
				<div className="user-info">
					<h2>User Information</h2>
					{userData.display_image_url && <img src={userData.display_image_url} alt="Profile" className="profile-image" />}
					<p>
						<strong>GID Name:</strong> {userData.gid_name}
					</p>
					<p>
						<strong>Display Name:</strong> {userData.display_name || "N/A"}
					</p>
					<p>
						<strong>Profile Picture Verified:</strong> {userData.profile_picture_verified ? "Yes" : "No"}
					</p>
					<p>
						<strong>Verified External Wallets:</strong>
					</p>
					{userData.externalWallet.length > 0 ? (
						<ul>
							{userData.externalWallet.map((wallet, index) => (
								<li key={index} className="wallet-item">
									<img src={getBlockchainIcon(wallet.type)} alt="Blockchain Icon" className="blockchain-icon" />
									{wallet.address}
									<button onClick={() => handleCopyClick(wallet.address)} className="copy-button">
										<FaCopy />
									</button>
								</li>
							))}
						</ul>
					) : (
						<p>No external wallets connected.</p>
					)}
				</div>
			)}
		</div>
	);
};

export default App;
