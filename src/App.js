import React, { useState, useEffect } from "react";
import { FaSearch, FaTimes, FaCopy } from "react-icons/fa";
import "./App.css";

const MIN_LENGTH = 26; // Minimum length of crypto addresses (e.g., Bitcoin)
const MAX_LENGTH = 128; // Maximum length of crypto addresses (e.g., Cardano)
const user_token =
	"eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI5RXVfeTNQTk5rZHlqNS1vMHhORXJCWG8wT0ZyME9LRXJKdkwzNXltcG5FIn0.eyJleHAiOjE3MTg5MDI1MjEsImlhdCI6MTcxODg4ODEyMSwianRpIjoiMzc0NmM3ZjMtMGFmMS00NjhjLTk1OTItMGYzNzhmODUyOGI3IiwiaXNzIjoiaHR0cHM6Ly9hdXRoLmdsb2JhbGlkLmRldi9yZWFsbXMvZ2xvYmFsaWQiLCJhdWQiOiI0Y2YyYzU3Yi1hYjY4LTQ0MTUtOWIxZC05ODc2ZGY1ZDMwN2YiLCJzdWIiOiI1OWE5NWY4Zi1jMGRjLTQxYjctOTgwOC0zMzljYWQyOTc1MjgiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJjaGVjay1pbnRyb3NwZWN0Iiwic2lkIjoiZTMxMGM2ODgtMTU4ZC00MGUzLWI0OTItMjlhOGI4NjhlMDI0IiwiYWNyIjoiMSIsInNjb3BlIjoib3BlbmlkIHVybjptYXRyaXg6b3JnLm1hdHJpeC5tc2MyOTY3LmNsaWVudDpkZXZpY2U6MTIzNTQzMiBub3RpZmljYXRpb25zLm1hbmFnZS1kZXZpY2VzIGtleXMubWFuYWdlIGNyZWRlbnRpYWxzLm1hbmFnZSB1cm46bWF0cml4Om9yZy5tYXRyaXgubXNjMjk2Ny5jbGllbnQ6YXBpOioiLCJnbG9iYWxpZCI6ImJvamFuZGV2IiwiZ3JvdXBzIjpbIkFVVEhFTlRJQ0FURUQiLCJkZWZhdWx0LXJvbGVzLWdsb2JhbGlkIiwid2FsbGV0LmNvbnZlcnQiXSwicHJlZmVycmVkX3VzZXJuYW1lIjoiNTlhOTVmOGYtYzBkYy00MWI3LTk4MDgtMzM5Y2FkMjk3NTI4IiwiY2xpZW50X2lkIjoiNGNmMmM1N2ItYWI2OC00NDE1LTliMWQtOTg3NmRmNWQzMDdmIiwidXNlcm5hbWUiOiI1OWE5NWY4Zi1jMGRjLTQxYjctOTgwOC0zMzljYWQyOTc1MjgifQ.NXZRR_teocmngGDvnbhNnz_R5NG9E5C9HeORbkKIhtcftZh-9QHwiuozcFbti9k8L6_krnBCrKC7IGEd33M4CpezjktptScZAVFEu7WnhWHia9nw9s5k0m9Ic3SMOS3TsgqyQU3PR7mo0ySEXnyWpipnA3vzK3dUl0sMqiDeSSgszp-fiXFnc3Opmw3NHg7sVP_XGHiT8GnBScCoeyu4lXn1mUUoACvip2xbfACU_3_6QxFGFMaPfWzCud87Qalzp1rfxEft6xzZdVuOm6mPCG95yAhfM571AexJOfrYw-KdXUG7VV1bT9o9YZAnYTHlSIfEFdQ0h4d_fHE_B16FQQ"; // Replace with the actual token

const solanaIcon = "https://cryptologos.cc/logos/solana-sol-logo.png";
const defaultAvatar = "https://img.icons8.com/?size=100&id=14736&format=png&color=000000"; // URL of a default avatar image

const App = () => {
	const [searchMode, setSearchMode] = useState("gid"); // State to track search mode
	const [inputValue, setInputValue] = useState("");
	const [userData, setUserData] = useState(null);
	const [error, setError] = useState(null);
	const [isButtonPulsing, setIsButtonPulsing] = useState(false);
	const [animateLine, setAnimateLine] = useState(false);

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
		setAnimateLine(true); // Start the animation

		setTimeout(() => {
			setAnimateLine(false); // Stop the animation after 3 seconds
		}, 3000);

		if (searchMode === "wallet" && (inputValue.length < MIN_LENGTH || inputValue.length > MAX_LENGTH)) {
			setError(`Wallet address length should be between ${MIN_LENGTH} and ${MAX_LENGTH} characters.`);
			setIsButtonPulsing(false);
			return;
		} else if (searchMode === "gid" && inputValue.trim() === "") {
			setError("GID name cannot be empty.");
			setIsButtonPulsing(false);
			return;
		}

		try {
			let foundUser = null;

			// Fetch the user's external wallet data
			const responseExternal = await fetch("https://api.globalid.dev/v1/blockchain/external/all", {
				headers: {
					Authorization: `Bearer ${user_token}`,
				},
			});

			if (!responseExternal.ok) {
				throw new Error(`HTTP error! status: ${responseExternal.status}`);
			}

			const externalData = await responseExternal.json();

			if (searchMode === "wallet") {
				foundUser = externalData.find((user) => user.address.toLowerCase() === inputValue.toLowerCase());

				if (!foundUser) {
					setError("Wallet address not claimed by any identity.");
					setIsButtonPulsing(false);
					return;
				}

				// Fetch the full user data from the identities API
				const responseIdentity = await fetch(`https://api.globalid.dev/v1/identities?gid_name=${foundUser.gid_name}`, {
					headers: {
						Authorization: `Bearer ${user_token}`,
					},
				});

				if (!responseIdentity.ok) {
					throw new Error(`HTTP error! status: ${responseIdentity.status}`);
				}

				const identityData = await responseIdentity.json();

				if (!identityData || identityData.length === 0 || !identityData[0].gid_uuid) {
					throw new Error("User not found");
				}

				const apiUser = identityData[0];
				apiUser.profile_picture_verified = apiUser.gid_name === "lisanalgaib" || "bojandev" ? true : apiUser.profile_picture_verified;
				apiUser.externalWallet = externalData.filter((user) => user.gid_uuid === apiUser.gid_uuid);
				setUserData(apiUser);
				setIsButtonPulsing(false);
				return;
			}

			// If searching by GID name
			const responseIdentity = await fetch(`https://api.globalid.dev/v1/identities?gid_name=${inputValue}`, {
				headers: {
					Authorization: `Bearer ${user_token}`,
				},
			});

			if (!responseIdentity.ok) {
				throw new Error(`HTTP error! status: ${responseIdentity.status}`);
			}

			const identityData = await responseIdentity.json();

			if (!identityData || identityData.length === 0 || !identityData[0].gid_uuid) {
				throw new Error("User not found");
			}

			const apiUser = identityData[0];
			apiUser.profile_picture_verified = apiUser.gid_name === "lisanalgaib" || "bojandev" ? true : apiUser.profile_picture_verified;
			apiUser.externalWallet = externalData.filter((user) => user.gid_uuid === apiUser.gid_uuid);
			setUserData(apiUser);
		} catch (error) {
			setError(error.message);
		} finally {
			setIsButtonPulsing(false);
		}
	};

	const getBlockchainIcon = () => {
		return solanaIcon;
	};

	const handleCopyClick = (address) => {
		navigator.clipboard.writeText(address).catch((err) => {
			console.error("Failed to copy address: ", err);
		});
	};

	return (
		<div className="container">
			<h1 className={animateLine ? "animate-line" : ""}>Wallet Address Checker</h1>
			<div className="tabs">
				<button className={`tab ${searchMode === "gid" ? "active" : ""}`} onClick={() => handleTabChange("gid")}>
					Search by GlobaliD Name
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
					<div className={`profile-image-container ${userData.profile_picture_verified ? "verified" : ""}`}>
						<img src={userData.display_image_url || defaultAvatar} alt="Profile" className="profile-image" />
						{userData.profile_picture_verified && <div className="checkmark"></div>}
					</div>
					{userData.profile_picture_verified ? null : <p className="warning-message">The user has not verified their profile photo. Please ask them to do so to ensure their identity.</p>}
					<p>
						<strong>GID Name:</strong> {userData.gid_name}
					</p>
					<p>
						<strong>Display Name:</strong> {userData.display_name || "N/A"}
					</p>
					<p>
						<strong>Created At:</strong> {new Date(userData.created_at).toLocaleString()}
					</p>

					<p>
						<strong>Verified External Wallets:</strong>
					</p>
					{userData.externalWallet.length > 0 ? (
						<ul>
							{userData.externalWallet.map((wallet, index) => (
								<li key={index} className="wallet-item">
									<img src={getBlockchainIcon()} alt="Blockchain Icon" className="blockchain-icon" />
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
