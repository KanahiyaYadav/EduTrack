package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Student model
type Student struct {
	gorm.Model
	Name    string
	Math    int
	Science int
	English int
}

var db *gorm.DB

func initDB() {
	// Replace the password value with your actual PostgreSQL password
	dsn := "host=localhost user=postgres password=password dbname=edutrack port=5432 sslmode=disable"

	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	err = db.AutoMigrate(&Student{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
}

func main() {
	initDB()

	router := gin.Default()

	// Enable CORS for frontend (React running on localhost:3000)
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Route for uploading student data
	router.POST("/upload", func(c *gin.Context) {
		var students []map[string]string

		if err := c.BindJSON(&students); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		for _, data := range students {
			student := Student{
				Name: data["Name"],
			}

			fmt.Sscanf(data["Math"], "%d", &student.Math)
			fmt.Sscanf(data["Science"], "%d", &student.Science)
			fmt.Sscanf(data["English"], "%d", &student.English)

			db.Create(&student)
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Data saved to database",
			"count":   len(students),
		})
	})

	router.GET("/students", func(c *gin.Context) {
		var students []Student
		result := db.Find(&students)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}
		c.JSON(http.StatusOK, students)
	})

	router.GET("/analytics", func(c *gin.Context) {
		var students []Student
		result := db.Find(&students)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}

		// Convert to []map[string]interface{}
		var inputData []map[string]interface{}
		for _, s := range students {
			record := map[string]interface{}{
				"Name":    s.Name,
				"Math":    s.Math,
				"Science": s.Science,
				"English": s.English,
			}
			inputData = append(inputData, record)
		}

		jsonData, _ := json.Marshal(inputData)

		// Execute the Python script
		cmd := exec.Command("python", "analytics/analyze.py")
		cmd.Stdin = bytes.NewReader(jsonData)
		var out bytes.Buffer
		cmd.Stdout = &out

		if err := cmd.Run(); err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		var resultData map[string]interface{}
		if err := json.Unmarshal(out.Bytes(), &resultData); err != nil {
			c.JSON(500, gin.H{"error": "Invalid JSON from Python"})
			return
		}

		c.JSON(200, resultData)
	})

	// Start server
	router.Run(":8080")
}
