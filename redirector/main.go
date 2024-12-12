package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
)

type RedirectResponse struct {
	OriginalUrl string `json:"originalUrl"`
}

func getAPIBaseURL() string {
	apiBaseURL := os.Getenv("API_BASE_URL")
	if apiBaseURL == "" {
		log.Fatal("API_BASE_URL environment variable is not set")
	}
	return apiBaseURL
}

func redirectHandler(w http.ResponseWriter, r *http.Request) {
	shortCode := r.URL.Path[1:] // Extract shortCode from URL path
	if shortCode == "" {
		http.Error(w, "Short code missing", http.StatusBadRequest)
		return
	}

	apiBaseURL := getAPIBaseURL()
	apiUrl := fmt.Sprintf("%s/shorten/%s", apiBaseURL, shortCode)

	// Query the API for the original URL
	resp, err := http.Get(apiUrl)
	if err != nil || resp.StatusCode != http.StatusOK {
		http.Error(w, "Short URL not found", http.StatusNotFound)
		return
	}
	defer resp.Body.Close()

	// Decode API response
	var redirectResp RedirectResponse
	if err := json.NewDecoder(resp.Body).Decode(&redirectResp); err != nil {
		http.Error(w, "Error decoding API response", http.StatusInternalServerError)
		return
	}

	// Add caching headers
	w.Header().Set("Cache-Control", "public, max-age=2592000") // Cache for 30 days

	// Perform the redirect
	http.Redirect(w, r, redirectResp.OriginalUrl, http.StatusFound)
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Default port if not set
	}

	http.HandleFunc("/", redirectHandler)
	fmt.Printf("Redirector service running on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
